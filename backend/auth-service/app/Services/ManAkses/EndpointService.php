<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\EndpointRepository;
use Illuminate\Support\Facades\Log;

/**
 * Endpoint Service
 * Business logic for WS endpoint management
 */
class EndpointService
{
    protected EndpointRepository $repository;

    public function __construct(EndpointRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of endpoints
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
                    'id_ws_endpoint' => $item->id_ws_endpoint,
                    'nm_group' => $item->nm_group,
                    'nm_method' => $item->nm_method,
                    'nm_endpoint' => $item->nm_endpoint,
                    'path_url' => $item->path_url,
                    'a_active' => (bool) $item->a_active,
                    'status' => $item->a_active ? 'Aktif' : 'Tidak Aktif',
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('EndpointService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get endpoint detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $endpoint = $this->repository->getDetail($id);

            if (!$endpoint) {
                return null;
            }

            return [
                'id_ws_endpoint' => $endpoint->id_ws_endpoint,
                'nm_group' => $endpoint->nm_group,
                'nm_method' => $endpoint->nm_method,
                'nm_endpoint' => $endpoint->nm_endpoint,
                'path_url' => $endpoint->path_url,
                'a_active' => (bool) $endpoint->a_active,
                'status' => $endpoint->a_active ? 'Aktif' : 'Tidak Aktif',
                'created_at' => $endpoint->created_at,
                'updated_at' => $endpoint->updated_at,
                'last_sync' => $endpoint->last_sync,
            ];
        } catch (\Exception $e) {
            Log::error('EndpointService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get all groups for dropdown
     *
     * @return array
     */
    public function getGroups(): array
    {
        try {
            $data = $this->repository->getGroups();

            return array_map(function ($item) {
                return $item->nm_group;
            }, $data);
        } catch (\Exception $e) {
            Log::error('EndpointService::getGroups error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get endpoint statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_endpoint' => (int) $stats->total_endpoint,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
                'total_group' => (int) $stats->total_group,
            ];
        } catch (\Exception $e) {
            Log::error('EndpointService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new endpoint
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            if ($this->repository->pathExists($data['path_url'], $data['nm_method'] ?? 'GET')) {
                throw new \Exception('Endpoint path dengan method tersebut sudah ada');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('EndpointService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing endpoint
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

            if ($this->repository->pathExists($data['path_url'], $data['nm_method'] ?? 'GET', $id)) {
                throw new \Exception('Endpoint path dengan method tersebut sudah ada');
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('EndpointService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete endpoint (soft delete)
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
            Log::error('EndpointService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
