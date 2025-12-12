<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\PenggunaRepository;
use Illuminate\Support\Facades\Log;

/**
 * Pengguna Service
 * Business logic for pengguna (user) management
 */
class PenggunaService
{
    protected PenggunaRepository $repository;

    public function __construct(PenggunaRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of pengguna
     *
     * @param array $params [page, limit, search, status, has_sso]
     * @return array
     */
    public function getList(array $params = []): array
    {
        try {
            $result = $this->repository->getList($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_pengguna' => $item->id_pengguna,
                    'username' => $item->username,
                    'nm_pengguna' => $item->nm_pengguna,
                    'email' => $item->email,
                    'jenis_kelamin' => $item->jenis_kelamin,
                    'no_hp' => $item->no_hp,
                    'jabatan' => $item->jabatan,
                    'a_aktif' => (bool) $item->a_aktif,
                    'disable' => (bool) $item->disable,
                    'status' => $item->a_aktif && !$item->disable ? 'Aktif' : 'Tidak Aktif',
                    'has_sso' => (bool) $item->has_sso,
                    'sumber_data' => $item->sumber_data,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                    'last_login_at' => $item->last_login_at,
                    'active_role' => $item->active_role ?? null,
                    'active_organisasi' => $item->active_organisasi ?? null,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('PenggunaService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get pengguna detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $pengguna = $this->repository->getDetail($id);

            if (!$pengguna) {
                return null;
            }

            $roles = $this->repository->getRoles($id);

            return [
                'id_pengguna' => $pengguna->id_pengguna,
                'username' => $pengguna->username,
                'nm_pengguna' => $pengguna->nm_pengguna,
                'email' => $pengguna->email,
                'jenis_kelamin' => $pengguna->jenis_kelamin,
                'tempat_lahir' => $pengguna->tempat_lahir,
                'tgl_lahir' => $pengguna->tgl_lahir,
                'alamat' => $pengguna->alamat,
                'no_tel' => $pengguna->no_tel,
                'no_hp' => $pengguna->no_hp,
                'jabatan' => $pengguna->jabatan,
                'a_aktif' => (bool) $pengguna->a_aktif,
                'disable' => (bool) $pengguna->disable,
                'status' => $pengguna->a_aktif && !$pengguna->disable ? 'Aktif' : 'Tidak Aktif',
                'approval_pengguna' => (bool) $pengguna->approval_pengguna,
                'has_sso' => (bool) $pengguna->has_sso,
                'sumber_data' => $pengguna->sumber_data,
                'tgl_create' => $pengguna->tgl_create,
                'last_update' => $pengguna->last_update,
                'last_login_at' => $pengguna->last_login_at,
                'last_login_ip' => $pengguna->last_login_ip,
                'roles' => array_map(function ($role) {
                    return [
                        'id_role_pengguna' => $role->id_role_pengguna,
                        'id_peran' => $role->id_peran,
                        'nm_peran' => $role->nm_peran,
                        'id_organisasi' => $role->id_organisasi,
                        'nm_organisasi' => $role->nm_organisasi,
                        'approval_peran' => (bool) $role->approval_peran,
                        'tgl_create' => $role->tgl_create,
                        'last_active' => $role->last_active,
                    ];
                }, $roles),
            ];
        } catch (\Exception $e) {
            Log::error('PenggunaService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get pengguna statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_pengguna' => (int) $stats->total_pengguna,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
                'total_sso' => (int) $stats->total_sso,
                'total_non_sso' => (int) $stats->total_non_sso,
            ];
        } catch (\Exception $e) {
            Log::error('PenggunaService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Update pengguna
     *
     * @param string $id
     * @param array $data
     * @return array|null
     */
    public function update(string $id, array $data): ?array
    {
        try {
            // Check if pengguna exists
            if (!$this->repository->exists($id)) {
                return null;
            }

            // Update pengguna
            $this->repository->update($id, $data);

            // Return updated pengguna detail
            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('PenggunaService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete pengguna (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        try {
            // Check if pengguna exists
            if (!$this->repository->exists($id)) {
                return false;
            }

            // Soft delete pengguna
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error('PenggunaService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
