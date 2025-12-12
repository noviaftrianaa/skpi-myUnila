<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\KategoriAplikasiRepository;
use Illuminate\Support\Facades\Log;

/**
 * Kategori Aplikasi Service
 * Business logic for kategori aplikasi management
 */
class KategoriAplikasiService
{
    protected KategoriAplikasiRepository $repository;

    public function __construct(KategoriAplikasiRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all categories (for dropdown)
     *
     * @return array
     */
    public function getAll(): array
    {
        try {
            $categories = $this->repository->getAll();

            return array_map(function ($item) {
                return [
                    'id_kategori' => $item->id_kategori,
                    'nm_kategori' => $item->nm_kategori,
                    'icon_kategori' => $item->icon_kategori,
                    'icon_color' => $item->icon_color,
                    'urutan' => (int) $item->urutan,
                    'a_aktif' => (bool) $item->a_aktif,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                ];
            }, $categories);
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::getAll error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get paginated list of categories
     *
     * @param array $params [page, limit, search]
     * @return array
     */
    public function getList(array $params = []): array
    {
        try {
            $result = $this->repository->getList($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_kategori' => $item->id_kategori,
                    'nm_kategori' => $item->nm_kategori,
                    'icon_kategori' => $item->icon_kategori,
                    'icon_color' => $item->icon_color,
                    'urutan' => (int) $item->urutan,
                    'a_aktif' => (bool) $item->a_aktif,
                    'jumlah_aplikasi' => (int) $item->jumlah_aplikasi,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get category detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $kategori = $this->repository->getDetail($id);

            if (!$kategori) {
                return null;
            }

            return [
                'id_kategori' => $kategori->id_kategori,
                'nm_kategori' => $kategori->nm_kategori,
                'icon_kategori' => $kategori->icon_kategori,
                'icon_color' => $kategori->icon_color,
                'urutan' => (int) $kategori->urutan,
                'a_aktif' => (bool) $kategori->a_aktif,
                'tgl_create' => $kategori->tgl_create,
                'last_update' => $kategori->last_update,
                'aplikasi' => array_map(function ($app) {
                    return [
                        'id_aplikasi' => $app->id_aplikasi,
                        'nm_aplikasi' => $app->nm_aplikasi,
                        'icon_name' => $app->icon_name,
                        'icon_color' => $app->icon_color,
                        'urutan' => (int) $app->urutan,
                        'a_tampil_portal' => (bool) $app->a_tampil_portal,
                        'a_maintenance' => (bool) $app->a_maintenance,
                        'a_coming_soon' => (bool) $app->a_coming_soon,
                    ];
                }, $kategori->aplikasi ?? []),
            ];
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get category statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_kategori' => (int) $stats->total_kategori,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
            ];
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new category
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            // Check if name already exists
            if ($this->repository->nameExists($data['nm_kategori'])) {
                throw new \Exception('Nama kategori sudah digunakan');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing category
     *
     * @param string $id
     * @param array $data
     * @return array|null
     */
    public function update(string $id, array $data): ?array
    {
        try {
            // Check if category exists
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return null;
            }

            // Check if name already exists (excluding current)
            if ($this->repository->nameExists($data['nm_kategori'], $id)) {
                throw new \Exception('Nama kategori sudah digunakan');
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete category (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        try {
            // Check if category exists
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return false;
            }

            // Check if category has apps
            if (!empty($existing->aplikasi) && count($existing->aplikasi) > 0) {
                throw new \Exception('Tidak dapat menghapus kategori yang masih memiliki aplikasi');
            }

            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error('KategoriAplikasiService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
