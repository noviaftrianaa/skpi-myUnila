<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\PeranRepository;
use Illuminate\Support\Facades\Log;

/**
 * Peran Service
 * Business logic for peran (role) management
 */
class PeranService
{
    protected PeranRepository $repository;

    public function __construct(PeranRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of peran
     *
     * @param array $params [page, limit, search, status]
     * @return array
     */
    public function getList(array $params = []): array
    {
        try {
            $result = $this->repository->getList($params);

            $result['data'] = array_map(function ($item) {
                return [
                    'id_peran' => $item->id_peran,
                    'nm_peran' => $item->nm_peran,
                    'a_perlu_sk' => (bool) $item->a_perlu_sk,
                    'status' => $item->status,
                    'jumlah_pengguna' => (int) $item->jumlah_pengguna,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                    'expired_date' => $item->expired_date,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('PeranService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get peran detail
     *
     * @param int $id
     * @return array|null
     */
    public function getDetail(int $id): ?array
    {
        try {
            $peran = $this->repository->getDetail($id);

            if (!$peran) {
                return null;
            }

            return [
                'id_peran' => $peran->id_peran,
                'nm_peran' => $peran->nm_peran,
                'a_perlu_sk' => (bool) $peran->a_perlu_sk,
                'status' => $peran->status,
                'jumlah_pengguna' => (int) $peran->jumlah_pengguna,
                'tgl_create' => $peran->tgl_create,
                'last_update' => $peran->last_update,
                'expired_date' => $peran->expired_date,
                'last_sync' => $peran->last_sync,
            ];
        } catch (\Exception $e) {
            Log::error('PeranService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get all peran for dropdown
     *
     * @return array
     */
    public function getAll(): array
    {
        try {
            $data = $this->repository->getAll();

            return array_map(function ($item) {
                return [
                    'id_peran' => $item->id_peran,
                    'nm_peran' => $item->nm_peran,
                    'a_perlu_sk' => (bool) $item->a_perlu_sk,
                ];
            }, $data);
        } catch (\Exception $e) {
            Log::error('PeranService::getAll error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get peran statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_peran' => (int) $stats->total_peran,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
            ];
        } catch (\Exception $e) {
            Log::error('PeranService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new peran
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            if ($this->repository->nameExists($data['nm_peran'])) {
                throw new \Exception('Nama peran sudah digunakan');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('PeranService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing peran
     *
     * @param int $id
     * @param array $data
     * @return array|null
     */
    public function update(int $id, array $data): ?array
    {
        try {
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return null;
            }

            if ($this->repository->nameExists($data['nm_peran'], $id)) {
                throw new \Exception('Nama peran sudah digunakan');
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('PeranService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete peran (soft delete)
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        try {
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return false;
            }

            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error('PeranService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
