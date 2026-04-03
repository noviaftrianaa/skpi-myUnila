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
     * Download dokumen pengajuan.
     */
    public function download(string $id): StreamedResponse|JsonResponse
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

            return $this->minioService->download($dokumen->path_file, $dokumen->nama_file_asli);
        } catch (\Exception $e) {
            Log::error('Dokumen.download: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Download dokumen hasil layanan.
     */
    public function downloadHasil(string $id): StreamedResponse|JsonResponse
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

            $downloadName = ($dokumen->nomor_dokumen ?? 'dokumen') . '.' . pathinfo($dokumen->path_file, PATHINFO_EXTENSION);
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
