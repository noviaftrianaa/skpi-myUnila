<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VerifikasiController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
    }

    /**
     * Verifikasi pengajuan (diajukan → diverifikasi).
     */
    public function verifikasi(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if ($pengajuan->status !== 'diajukan') {
                return $this->errorResponse('Pengajuan tidak dalam status yang bisa diverifikasi', 422);
            }

            $data = $request->validate(['catatan' => 'nullable|string']);
            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Tentukan status tujuan berdasarkan kategori layanan
            $statusTujuan = $pengajuan->kategori === 'surat_mandiri' ? 'diverifikasi' : 'menunggu_persetujuan';
            $this->repository->updateStatus($id, $statusTujuan, $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Diverifikasi',
                'status_dari' => 'diajukan',
                'status_ke' => $statusTujuan,
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'admin_bak',
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->pgCommit();
            return $this->successResponse(null, 'Pengajuan berhasil diverifikasi');
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.verifikasi: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Minta perbaikan (diajukan → perlu_perbaikan).
     */
    public function mintaPerbaikan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if ($pengajuan->status !== 'diajukan') {
                return $this->errorResponse('Status pengajuan tidak valid', 422);
            }

            $data = $request->validate(['catatan' => 'required|string']);
            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'perlu_perbaikan', $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Perlu Perbaikan',
                'status_dari' => 'diajukan',
                'status_ke' => 'perlu_perbaikan',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'admin_bak',
                'catatan' => $data['catatan'],
            ]);

            $this->repository->pgCommit();
            return $this->successResponse(null, 'Permintaan perbaikan berhasil dikirim');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.mintaPerbaikan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Terbitkan surat (diverifikasi → terbit). Untuk surat mandiri.
     */
    public function terbitkan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if (!in_array($pengajuan->status, ['diverifikasi', 'disetujui'])) {
                return $this->errorResponse('Status pengajuan tidak valid untuk penerbitan', 422);
            }

            $data = $request->validate([
                'nomor_dokumen' => 'nullable|string|max:100',
                'catatan' => 'nullable|string',
            ]);
            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'terbit', $user->id_pengguna);

            // Update nomor dokumen hasil jika ada
            if (!empty($data['nomor_dokumen'])) {
                $this->repository->pgUpdate(
                    "UPDATE layanan.pengajuan SET nomor_dokumen_hasil = ?, tgl_dokumen_hasil = CURRENT_DATE WHERE id_pengajuan = ?",
                    [$data['nomor_dokumen'], $id]
                );
            }

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Surat Diterbitkan',
                'status_dari' => $pengajuan->status,
                'status_ke' => 'terbit',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'admin_bak',
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->pgCommit();
            return $this->successResponse(null, 'Surat berhasil diterbitkan');
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.terbitkan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
