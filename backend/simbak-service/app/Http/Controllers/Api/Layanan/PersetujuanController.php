<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Services\WorkflowService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PersetujuanController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;
    protected WorkflowService $workflow;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->workflow = new WorkflowService();
    }

    /**
     * Queue persetujuan — filter berdasarkan kode_role user.
     * Hanya tampilkan pengajuan yang ada di tahapan user.
     */
    public function queue(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'kode_role' => $kodeRole,
            ];
            $result = $this->repository->getApprovalQueueByRole($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Persetujuan.queue: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Approve pengajuan — mengikuti tahapan_layanan.
     *
     * Status tujuan ditentukan oleh status_selesai di tahapan, bukan hardcode.
     * Contoh:
     *   - PM-CUTI tahap 4 (pejabat): menunggu_persetujuan → disetujui
     *   - PM-ALIH tahap 5 (pejabat): diverifikasi → disetujui
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $data = $request->validate(['catatan' => 'nullable|string']);
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan yang cocok untuk aktor ini
            $tahapan = $this->workflow->findTahapanForActor($pengajuan, $kodeRole);

            if (!$tahapan) {
                // Fallback untuk backward compat: cek apakah pengajuan di status menunggu_persetujuan
                if ($pengajuan->status === 'menunggu_persetujuan') {
                    $tahapan = $this->workflow->getCurrentTahapan($pengajuan);
                }
            }

            if (!$tahapan) {
                return $this->errorResponse(
                    "Anda tidak memiliki akses untuk menyetujui pengajuan ini pada tahapan saat ini",
                    403
                );
            }

            $statusTujuan = $tahapan->status_selesai;

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, $statusTujuan, $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $riwayat = $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'id_tahapan' => $tahapan->id_tahapan,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => $tahapan->nm_tahapan,
                'status_dari' => $pengajuan->status,
                'status_ke' => $statusTujuan,
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->createPersetujuan([
                'id_pengajuan' => $id,
                'id_riwayat' => $riwayat->id_riwayat ?? null,
                'id_approver' => $user->id_pengguna,
                'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_approver' => $kodeRole,
                'keputusan' => 'disetujui',
                'catatan' => $data['catatan'] ?? null,
                'id_creator' => $user->id_pengguna,
            ]);

            $this->repository->pgCommit();

            $nextTahapan = $this->workflow->getNextTahapan($pengajuan, $tahapan);
            $message = "Pengajuan berhasil disetujui";
            if ($nextTahapan) {
                $message .= ". Tahapan selanjutnya: {$nextTahapan->nm_tahapan}";
            }

            return $this->successResponse([
                'status_baru' => $statusTujuan,
                'tahapan_selesai' => $tahapan->nm_tahapan,
                'tahapan_selanjutnya' => $nextTahapan ? [
                    'nm_tahapan' => $nextTahapan->nm_tahapan,
                    'kode_role' => $nextTahapan->kode_role,
                ] : null,
            ], $message);
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Persetujuan.approve: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Reject pengajuan — tolak di tahapan manapun.
     * Status selalu menjadi 'ditolak', dengan catatan di tahapan mana ditolak.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            if (in_array($pengajuan->status, ['draft', 'terbit', 'ditolak'])) {
                return $this->errorResponse('Pengajuan tidak dalam status yang bisa ditolak', 422);
            }

            $data = $request->validate(['catatan' => 'required|string']);
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan saat ini untuk konteks
            $tahapan = $this->workflow->findTahapanForActor($pengajuan, $kodeRole)
                ?? $this->workflow->getCurrentTahapan($pengajuan);

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'ditolak', $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $riwayat = $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'id_tahapan' => $tahapan->id_tahapan ?? null,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Ditolak' . ($tahapan ? " (pada tahap: {$tahapan->nm_tahapan})" : ''),
                'status_dari' => $pengajuan->status,
                'status_ke' => 'ditolak',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'],
            ]);

            $this->repository->createPersetujuan([
                'id_pengajuan' => $id,
                'id_riwayat' => $riwayat->id_riwayat ?? null,
                'id_approver' => $user->id_pengguna,
                'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_approver' => $kodeRole,
                'keputusan' => 'ditolak',
                'catatan' => $data['catatan'],
                'id_creator' => $user->id_pengguna,
            ]);

            $this->repository->pgCommit();
            return $this->successResponse(null, 'Pengajuan berhasil ditolak');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Persetujuan.reject: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Keputusan Fakultas Tujuan — khusus Alih Program (PM-ALIH).
     * Admin fakultas tujuan input: diterima/ditolak, hasil wawancara, konversi SKS.
     */
    public function terimaTujuan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            if ($pengajuan->kode_layanan !== 'PM-ALIH') {
                return $this->errorResponse('Endpoint ini hanya untuk layanan Alih Program', 422);
            }

            $data = $request->validate([
                'a_diterima_tujuan' => 'required|boolean',
                'hasil_wawancara' => 'nullable|string',
                'daftar_konversi_sks' => 'nullable|string', // JSON string
                'catatan' => 'nullable|string',
            ]);

            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan untuk admin_fakultas di status saat ini
            $tahapan = $this->workflow->findTahapanForActor($pengajuan, 'admin_fakultas')
                ?? $this->workflow->getCurrentTahapan($pengajuan);

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Jika ditolak oleh fakultas tujuan, status → ditolak
            if (!$data['a_diterima_tujuan']) {
                $this->repository->updateStatus($id, 'ditolak', $user->id_pengguna);

                $riwayatCount = count($this->repository->getRiwayat($id));
                $riwayat = $this->repository->createRiwayat([
                    'id_pengajuan' => $id,
                    'id_tahapan' => $tahapan->id_tahapan ?? null,
                    'urutan' => $riwayatCount + 1,
                    'nm_tahapan' => 'Ditolak oleh Fakultas Tujuan',
                    'status_dari' => $pengajuan->status,
                    'status_ke' => 'ditolak',
                    'id_aktor' => $user->id_pengguna,
                    'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                    'kode_role_aktor' => $kodeRole,
                    'catatan' => $data['catatan'] ?? 'Tidak diterima oleh fakultas tujuan',
                ]);

                $this->repository->createPersetujuan([
                    'id_pengajuan' => $id,
                    'id_riwayat' => $riwayat->id_riwayat ?? null,
                    'id_approver' => $user->id_pengguna,
                    'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                    'kode_role_approver' => $kodeRole,
                    'keputusan' => 'ditolak',
                    'a_diterima_tujuan' => false,
                    'hasil_wawancara' => $data['hasil_wawancara'] ?? null,
                    'catatan' => $data['catatan'] ?? null,
                    'id_creator' => $user->id_pengguna,
                ]);

                $this->repository->pgCommit();
                return $this->successResponse(null, 'Pengajuan alih program ditolak oleh fakultas tujuan');
            }

            // Jika diterima, lanjut ke tahapan berikutnya
            $statusTujuan = $tahapan->status_selesai ?? 'menunggu_persetujuan';
            $this->repository->updateStatus($id, $statusTujuan, $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $riwayat = $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'id_tahapan' => $tahapan->id_tahapan ?? null,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => $tahapan->nm_tahapan ?? 'Diterima oleh Fakultas Tujuan',
                'status_dari' => $pengajuan->status,
                'status_ke' => $statusTujuan,
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->createPersetujuan([
                'id_pengajuan' => $id,
                'id_riwayat' => $riwayat->id_riwayat ?? null,
                'id_approver' => $user->id_pengguna,
                'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_approver' => $kodeRole,
                'keputusan' => 'disetujui',
                'a_diterima_tujuan' => true,
                'hasil_wawancara' => $data['hasil_wawancara'] ?? null,
                'daftar_konversi_sks' => $data['daftar_konversi_sks'] ?? null,
                'catatan' => $data['catatan'] ?? null,
                'id_creator' => $user->id_pengguna,
            ]);

            $this->repository->pgCommit();
            return $this->successResponse([
                'status_baru' => $statusTujuan,
            ], 'Pengajuan alih program diterima oleh fakultas tujuan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Persetujuan.terimaTujuan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
