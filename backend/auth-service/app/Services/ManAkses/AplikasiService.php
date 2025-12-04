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
                'nm_aplikasi' => $aplikasi->nm_aplikasi,
                'ket_aplikasi' => $aplikasi->ket_aplikasi,
                'token_aplikasi' => $aplikasi->token_aplikasi,
                'app_key' => $aplikasi->app_key,
                'url' => $aplikasi->url,
                'port' => $aplikasi->port,
                'teknologi' => $aplikasi->teknologi,
                'endpoint_ws' => $aplikasi->endpoint_ws,
                'a_generate_menu' => (bool) $aplikasi->a_generate_menu,
                'a_integrasi_cas' => (bool) $aplikasi->a_integrasi_cas,
                'a_sistem_internal_pt' => (bool) $aplikasi->a_sistem_internal_pt,
                'status' => $aplikasi->status,
                'jenis' => $aplikasi->jenis,
                'nm_organisasi' => $aplikasi->nm_organisasi,
                'tgl_create' => $aplikasi->tgl_create,
                'last_update' => $aplikasi->last_update,
                'expired_date' => $aplikasi->expired_date,
                'last_sync' => $aplikasi->last_sync,
                'tables' => array_map(function ($table) {
                    return [
                        'id_table_app' => $table->id_table_app,
                        'nm_table' => $table->nm_table,
                        'ket_table' => $table->ket_table,
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
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
                'total_internal' => (int) $stats->total_internal,
                'total_external' => (int) $stats->total_external,
                'total_integrasi_cas' => (int) $stats->total_integrasi_cas,
            ];
        } catch (\Exception $e) {
            Log::error('AplikasiService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
