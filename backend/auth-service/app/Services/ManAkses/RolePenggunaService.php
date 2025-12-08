<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\RolePenggunaRepository;
use Illuminate\Support\Facades\Log;

/**
 * Role Pengguna Service
 * Business logic for role pengguna management
 */
class RolePenggunaService
{
    protected RolePenggunaRepository $repository;

    public function __construct(RolePenggunaRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of role pengguna
     *
     * @param array $params
     * @return array
     */
    public function getList(array $params = []): array
    {
        try {
            $result = $this->repository->getList($params);

            $result['data'] = array_map(function ($item) {
                return [
                    'id_role_pengguna' => $item->id_role_pengguna,
                    'id_pengguna' => $item->id_pengguna,
                    'nm_pengguna' => $item->nm_pengguna,
                    'username' => $item->username,
                    'id_peran' => $item->id_peran,
                    'nm_peran' => $item->nm_peran,
                    'id_organisasi' => $item->id_organisasi,
                    'nm_organisasi' => $item->nm_organisasi,
                    'sk_penugasan' => $item->sk_penugasan,
                    'tgl_sk_penugasan' => $item->tgl_sk_penugasan,
                    'approval_peran' => (bool) $item->approval_peran,
                    'last_active' => $item->last_active,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get role pengguna detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $role = $this->repository->getDetail($id);

            if (!$role) {
                return null;
            }

            return [
                'id_role_pengguna' => $role->id_role_pengguna,
                'id_pengguna' => $role->id_pengguna,
                'nm_pengguna' => $role->nm_pengguna,
                'username' => $role->username,
                'email' => $role->email,
                'id_peran' => $role->id_peran,
                'nm_peran' => $role->nm_peran,
                'id_organisasi' => $role->id_organisasi,
                'nm_organisasi' => $role->nm_organisasi,
                'sk_penugasan' => $role->sk_penugasan,
                'tgl_sk_penugasan' => $role->tgl_sk_penugasan,
                'approval_peran' => (bool) $role->approval_peran,
                'last_active' => $role->last_active,
                'tgl_create' => $role->tgl_create,
                'last_update' => $role->last_update,
                'last_sync' => $role->last_sync,
            ];
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get roles by pengguna ID
     *
     * @param string $idPengguna
     * @return array
     */
    public function getByPengguna(string $idPengguna): array
    {
        try {
            $roles = $this->repository->getByPengguna($idPengguna);

            return array_map(function ($item) {
                return [
                    'id_role_pengguna' => $item->id_role_pengguna,
                    'id_peran' => $item->id_peran,
                    'nm_peran' => $item->nm_peran,
                    'id_organisasi' => $item->id_organisasi,
                    'nm_organisasi' => $item->nm_organisasi,
                    'approval_peran' => (bool) $item->approval_peran,
                    'last_active' => $item->last_active,
                ];
            }, $roles);
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::getByPengguna error', [
                'message' => $e->getMessage(),
                'id_pengguna' => $idPengguna
            ]);
            throw $e;
        }
    }

    /**
     * Create new role pengguna
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            if ($this->repository->roleExists($data['id_pengguna'], $data['id_peran'], $data['id_organisasi'] ?? null)) {
                throw new \Exception('Role sudah ditambahkan untuk pengguna ini');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing role pengguna
     *
     * @param string $id
     * @param array $data
     * @return array|null
     */
    public function update(string $id, array $data): ?array
    {
        try {
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return null;
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete role pengguna (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        try {
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return false;
            }

            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error('RolePenggunaService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
