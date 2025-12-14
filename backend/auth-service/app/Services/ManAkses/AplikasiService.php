<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\AplikasiRepository;
use Illuminate\Support\Facades\Log;

/**
 * Aplikasi Service
 * Business logic for aplikasi (application) management
 */
class AplikasiService
{
    protected AplikasiRepository $repository;

    public function __construct(AplikasiRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of aplikasi
     *
     * @param array $params [page, limit, search, status, jenis]
     * @return array
     */
    public function getList(array $params = []): array
    {
        try {
            $result = $this->repository->getList($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_aplikasi' => $item->id_aplikasi,
                    'nm_aplikasi' => $item->nm_aplikasi,
                    'ket_aplikasi' => $item->ket_aplikasi,
                    'url' => $item->url,
                    'port' => $item->port,
                    'teknologi' => $item->teknologi,
                    'endpoint_ws' => $item->endpoint_ws,
                    'a_generate_menu' => (bool) $item->a_generate_menu,
                    'a_integrasi_cas' => (bool) $item->a_integrasi_cas,
                    'a_sistem_internal_pt' => (bool) $item->a_sistem_internal_pt,
                    'status' => $item->status,
                    'jenis' => $item->jenis,
                    'id_organisasi' => $item->id_organisasi,
                    'nm_organisasi' => $item->nm_organisasi,
                    'id_kategori' => $item->id_kategori,
                    'nm_kategori' => $item->nm_kategori,
                    'icon_name' => $item->icon_name,
                    'icon_color' => $item->icon_color,
                    'app_slug' => $item->app_slug,
                    'urutan' => (int) $item->urutan,
                    'a_tampil_portal' => (bool) $item->a_tampil_portal,
                    'a_maintenance' => (bool) $item->a_maintenance,
                    'a_coming_soon' => (bool) $item->a_coming_soon,
                    'a_terintegrasi' => (bool) $item->a_terintegrasi,
                    'a_live' => (bool) $item->a_live,
                    'jumlah_table' => (int) $item->jumlah_table,
                    'jumlah_pj' => (int) $item->jumlah_pj,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                    'expired_date' => $item->expired_date,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('AplikasiService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get aplikasi detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $aplikasi = $this->repository->getDetail($id);

            if (!$aplikasi) {
                return null;
            }

            return [
                'id_aplikasi' => $aplikasi->id_aplikasi,
                'id_blob' => $aplikasi->id_blob,
                'id_organisasi' => $aplikasi->id_organisasi,
                'id_kategori' => $aplikasi->id_kategori,
                'nm_aplikasi' => $aplikasi->nm_aplikasi,
                'ket_aplikasi' => $aplikasi->ket_aplikasi,
                'token_aplikasi' => $aplikasi->token_aplikasi,
                'app_key' => $aplikasi->app_key,
                'url' => $aplikasi->url,
                'port' => $aplikasi->port,
                'teknologi' => $aplikasi->teknologi,
                'endpoint_ws' => $aplikasi->endpoint_ws,
                'icon_name' => $aplikasi->icon_name,
                'icon_color' => $aplikasi->icon_color,
                'app_slug' => $aplikasi->app_slug,
                'urutan' => (int) $aplikasi->urutan,
                'a_generate_menu' => (bool) $aplikasi->a_generate_menu,
                'a_integrasi_cas' => (bool) $aplikasi->a_integrasi_cas,
                'a_sistem_internal_pt' => (bool) $aplikasi->a_sistem_internal_pt,
                'a_tampil_portal' => (bool) $aplikasi->a_tampil_portal,
                'a_maintenance' => (bool) $aplikasi->a_maintenance,
                'a_coming_soon' => (bool) $aplikasi->a_coming_soon,
                'a_terintegrasi' => (bool) $aplikasi->a_terintegrasi,
                'a_live' => (bool) $aplikasi->a_live,
                'status' => $aplikasi->status,
                'jenis' => $aplikasi->jenis,
                'nm_organisasi' => $aplikasi->nm_organisasi,
                'nm_kategori' => $aplikasi->nm_kategori,
                'tgl_create' => $aplikasi->tgl_create,
                'last_update' => $aplikasi->last_update,
                'expired_date' => $aplikasi->expired_date,
                'last_sync' => $aplikasi->last_sync,
                'tables' => array_map(function ($table) {
                    return [
                        'id_akses_table_app' => $table->id_akses_table_app,
                        'id_table_app' => $table->id_table_app,
                        'nm_table' => $table->nm_table,
                        'tabel_alias' => $table->tabel_alias,
                        'skema_tbl' => $table->skema_tbl,
                        'a_boleh_get' => (bool) $table->a_boleh_get,
                        'a_boleh_insert' => (bool) $table->a_boleh_insert,
                        'a_boleh_update' => (bool) $table->a_boleh_update,
                        'a_boleh_delete' => (bool) $table->a_boleh_delete,
                        'tgl_create' => $table->tgl_create,
                        'last_update' => $table->last_update,
                    ];
                }, $aplikasi->tables ?? []),
                'pj_list' => array_map(function ($pj) {
                    return [
                        'id_pj_aplikasi' => $pj->id_pj_aplikasi,
                        'id_pengguna' => $pj->id_pengguna,
                        'nm_pengguna' => $pj->nm_pengguna,
                        'username' => $pj->username,
                        'email' => $pj->email,
                        'tgl_create' => $pj->tgl_create,
                        'last_update' => $pj->last_update,
                    ];
                }, $aplikasi->pj_list ?? []),
                'menus' => array_map(function ($menu) {
                    return [
                        'id_menu' => $menu->id_menu,
                        'id_group_menu' => $menu->id_group_menu ?? null,
                        'nm_menu' => $menu->nm_menu,
                        'icon' => $menu->icon ?? null,
                        'url_menu' => $menu->url_menu ?? null,
                        'urutan' => (int) ($menu->urutan ?? 0),
                        'level_menu' => (int) ($menu->level_menu ?? 1),
                        'a_aktif' => (bool) ($menu->a_aktif ?? true),
                        'tgl_create' => $menu->tgl_create ?? null,
                        'last_update' => $menu->last_update ?? null,
                    ];
                }, $aplikasi->menus ?? []),
            ];
        } catch (\Exception $e) {
            Log::error('AplikasiService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get aplikasi statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_aplikasi' => (int) $stats->total_aplikasi,
                'total_live' => (int) $stats->total_live,
                'total_dev' => (int) $stats->total_dev,
                'total_terintegrasi' => (int) $stats->total_terintegrasi,
                'total_portal' => (int) $stats->total_portal,
                'total_maintenance' => (int) $stats->total_maintenance,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
            ];
        } catch (\Exception $e) {
            Log::error('AplikasiService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new aplikasi
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            // Check if name already exists
            if ($this->repository->nameExists($data['nm_aplikasi'])) {
                throw new \Exception('Nama aplikasi sudah digunakan');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('AplikasiService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing aplikasi
     *
     * @param string $id
     * @param array $data
     * @return array|null
     */
    public function update(string $id, array $data): ?array
    {
        try {
            // Check if aplikasi exists
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return null;
            }

            // Check if name already exists (excluding current)
            if ($this->repository->nameExists($data['nm_aplikasi'], $id)) {
                throw new \Exception('Nama aplikasi sudah digunakan');
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('AplikasiService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete aplikasi (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        try {
            // Check if aplikasi exists
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return false;
            }

            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error('AplikasiService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get all categories for dropdown
     *
     * @return array
     */
    public function getCategories(): array
    {
        try {
            $categories = $this->repository->getCategories();

            return array_map(function ($cat) {
                return [
                    'id_kategori' => $cat->id_kategori,
                    'nm_kategori' => $cat->nm_kategori,
                    'icon_kategori' => $cat->icon_kategori,
                    'icon_color' => $cat->icon_color,
                    'urutan' => (int) $cat->urutan,
                ];
            }, $categories);
        } catch (\Exception $e) {
            Log::error('AplikasiService::getCategories error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Regenerate app_key for an aplikasi
     *
     * @param string $id
     * @return array|null
     */
    public function regenerateAppKey(string $id): ?array
    {
        try {
            // Check if aplikasi exists
            $existing = $this->repository->getDetail($id);
            if (!$existing) {
                return null;
            }

            $newAppKey = $this->repository->regenerateAppKey($id);

            if (!$newAppKey) {
                throw new \Exception('Gagal generate app key baru');
            }

            return [
                'id_aplikasi' => $id,
                'app_key' => $newAppKey,
            ];
        } catch (\Exception $e) {
            Log::error('AplikasiService::regenerateAppKey error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
