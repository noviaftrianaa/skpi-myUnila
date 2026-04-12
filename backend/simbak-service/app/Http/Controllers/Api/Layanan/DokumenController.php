<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Services\MinioService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DokumenController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->minioService = new MinioService();
    }

    /**
     * Download atau preview dokumen pengajuan.
     * Tambah ?preview=1 di URL untuk menampilkan inline (bukan download).
     */
    public function download(Request $request, string $id): StreamedResponse|JsonResponse|\Illuminate\Http\Response
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_pengajuan WHERE id_dokumen = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen tidak ditemukan');

            if (!$dokumen->path_file || !$this->minioService->exists($dokumen->path_file)) {
                return $this->notFoundResponse('File tidak ditemukan di storage');
            }

            $isPreview = $request->query('preview') === '1';

            if ($isPreview) {
                $response = $this->minioService->inline($dokumen->path_file, $dokumen->nama_file_asli);
                // Izinkan iframe cross-origin untuk preview
                $response->headers->set('X-Frame-Options', 'ALLOWALL');
                $response->headers->set('Content-Security-Policy', 'frame-ancestors *');
                $response->headers->set('Access-Control-Allow-Origin', '*');
                return $response;
            }

            return $this->minioService->download($dokumen->path_file, $dokumen->nama_file_asli);
        } catch (\Exception $e) {
            Log::error('Dokumen.download: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Download atau preview dokumen hasil layanan.
     */
    public function downloadHasil(Request $request, string $id): StreamedResponse|JsonResponse|\Illuminate\Http\Response
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_hasil WHERE id_dokumen_hasil = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen hasil tidak ditemukan');

            if (!$dokumen->path_file || !$this->minioService->exists($dokumen->path_file)) {
                return $this->notFoundResponse('File tidak ditemukan di storage');
            }

            $nomorClean = str_replace(['/', '\\'], '-', $dokumen->nomor_dokumen ?? 'dokumen');
            $downloadName = $nomorClean . '.' . pathinfo($dokumen->path_file, PATHINFO_EXTENSION);

            $isPreview = $request->query('preview') === '1';
            if ($isPreview) {
                $response = $this->minioService->inline($dokumen->path_file, $downloadName);
                $response->headers->set('X-Frame-Options', 'ALLOWALL');
                $response->headers->set('Content-Security-Policy', 'frame-ancestors *');
                $response->headers->set('Access-Control-Allow-Origin', '*');
                return $response;
            }

            return $this->minioService->download($dokumen->path_file, $downloadName);
        } catch (\Exception $e) {
            Log::error('Dokumen.downloadHasil: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Delete dokumen pengajuan (soft delete + hapus file MinIO).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_pengajuan WHERE id_dokumen = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen tidak ditemukan');

            // Hapus file dari MinIO (best effort)
            if ($dokumen->path_file) {
                try {
                    $this->minioService->delete($dokumen->path_file);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete file from MinIO: ' . $e->getMessage());
                }
            }

            $user = $request->user();
            $this->repository->deleteDokumen($id, $user->id_pengguna ?? null);
            return $this->successResponse(null, 'Dokumen berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Dokumen.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
