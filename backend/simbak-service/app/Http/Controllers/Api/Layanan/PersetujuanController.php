<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PersetujuanController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
    }

    /**
     * Queue persetujuan — pengajuan yang menunggu persetujuan.
     */
    public function queue(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
            ];
            $result = $this->repository->getApprovalQueue($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Persetujuan.queue: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Approve pengajuan (menunggu_persetujuan → disetujui).
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if ($pengajuan->status !== 'menunggu_persetujuan') {
                return $this->errorResponse('Pengajuan tidak dalam status menunggu persetujuan', 422);
            }

            $data = $request->validate(['catatan' => 'nullable|string']);
            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'disetujui', $user->id_pengguna);

            // Catat persetujuan
            $riwayatCount = count($this->repository->getRiwayat($id));
            $riwayat = $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Disetujui',
                'status_dari' => 'menunggu_persetujuan',
                'status_ke' => 'disetujui',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'pejabat',
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->createPersetujuan([
                'id_pengajuan' => $id,
                'id_riwayat' => $riwayat->id_riwayat ?? null,
                'id_approver' => $user->id_pengguna,
                'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_approver' => 'pejabat',
                'keputusan' => 'disetujui',
                'catatan' => $data['catatan'] ?? null,
                'id_creator' => $user->id_pengguna,
            ]);

            $this->repository->pgCommit();
            return $this->successResponse(null, 'Pengajuan berhasil disetujui');
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Persetujuan.approve: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Reject pengajuan (menunggu_persetujuan → ditolak).
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if ($pengajuan->status !== 'menunggu_persetujuan') {
                return $this->errorResponse('Pengajuan tidak dalam status menunggu persetujuan', 422);
            }

            $data = $request->validate(['catatan' => 'required|string']);
            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'ditolak', $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $riwayat = $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Ditolak',
                'status_dari' => 'menunggu_persetujuan',
                'status_ke' => 'ditolak',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'pejabat',
                'catatan' => $data['catatan'],
            ]);

            $this->repository->createPersetujuan([
                'id_pengajuan' => $id,
                'id_riwayat' => $riwayat->id_riwayat ?? null,
                'id_approver' => $user->id_pengguna,
                'nm_approver' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_approver' => 'pejabat',
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
}
