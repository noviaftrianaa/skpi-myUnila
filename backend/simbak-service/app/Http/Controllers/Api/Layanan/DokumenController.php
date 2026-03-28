<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Services\MinioService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DokumenController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
    }

    /**
     * Download dokumen pengajuan.
     */
    public function download(string $id): JsonResponse
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_pengajuan WHERE id_dokumen = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen tidak ditemukan');

            // TODO: integrate MinioService download
            return $this->successResponse([
                'nm_dokumen' => $dokumen->nm_dokumen,
                'nama_file_asli' => $dokumen->nama_file_asli,
                'path_file' => $dokumen->path_file,
                'tipe_file' => $dokumen->tipe_file,
                'ukuran_byte' => $dokumen->ukuran_byte,
            ], 'URL download dokumen');
        } catch (\Exception $e) {
            Log::error('Dokumen.download: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Download dokumen hasil layanan.
     */
    public function downloadHasil(string $id): JsonResponse
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_hasil WHERE id_dokumen_hasil = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen hasil tidak ditemukan');

            // TODO: integrate MinioService download
            return $this->successResponse([
                'nm_dokumen' => $dokumen->nm_dokumen,
                'path_file' => $dokumen->path_file,
                'tipe_file' => $dokumen->tipe_file,
                'ukuran_byte' => $dokumen->ukuran_byte,
                'nomor_dokumen' => $dokumen->nomor_dokumen,
                'tgl_dokumen' => $dokumen->tgl_dokumen,
            ], 'URL download dokumen hasil');
        } catch (\Exception $e) {
            Log::error('Dokumen.downloadHasil: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Delete dokumen pengajuan (soft delete).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $dokumen = $this->repository->pgSelectOne(
                "SELECT * FROM layanan.dokumen_pengajuan WHERE id_dokumen = ? AND soft_delete = false",
                [$id]
            );
            if (!$dokumen) return $this->notFoundResponse('Dokumen tidak ditemukan');

            $user = $request->user();
            $this->repository->deleteDokumen($id, $user->id_pengguna ?? null);
            return $this->successResponse(null, 'Dokumen berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Dokumen.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
