<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\UnitOrganisasiRepository;
use Illuminate\Support\Facades\Log;

/**
 * Unit Organisasi Service
 * Business logic for unit organisasi management
 */
class UnitOrganisasiService
{
    protected UnitOrganisasiRepository $repository;

    public function __construct(UnitOrganisasiRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of unit organisasi
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
                    'id_organisasi' => $item->id_organisasi,
                    'nm_lemb' => $item->nm_lemb,
                    'jln' => $item->jln,
                    'no_tel' => $item->no_tel,
                    'email' => $item->email,
                    'website' => $item->website,
                    'level_organisasi' => $item->level_organisasi,
                    'a_aktif' => (bool) $item->a_aktif,
                    'status' => $item->a_aktif ? 'Aktif' : 'Tidak Aktif',
                    'id_induk_organisasi' => $item->id_induk_organisasi,
                    'nm_induk_organisasi' => $item->nm_induk_organisasi,
                    'tgl_create' => $item->tgl_create,
                    'last_update' => $item->last_update,
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::getList error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get unit organisasi detail
     *
     * @param string $id
     * @return array|null
     */
    public function getDetail(string $id): ?array
    {
        try {
            $unit = $this->repository->getDetail($id);

            if (!$unit) {
                return null;
            }

            return [
                'id_organisasi' => $unit->id_organisasi,
                'nm_lemb' => $unit->nm_lemb,
                'jln' => $unit->jln,
                'rt' => $unit->rt,
                'rw' => $unit->rw,
                'nm_dsn' => $unit->nm_dsn,
                'ds_kel' => $unit->ds_kel,
                'kode_pos' => $unit->kode_pos,
                'lintang' => $unit->lintang,
                'bujur' => $unit->bujur,
                'no_tel' => $unit->no_tel,
                'no_fax' => $unit->no_fax,
                'email' => $unit->email,
                'website' => $unit->website,
                'kd_kl' => $unit->kd_kl,
                'kd_satker' => $unit->kd_satker,
                'level_organisasi' => $unit->level_organisasi,
                'id_lembaga_asal' => $unit->id_lembaga_asal,
                'a_aktif' => (bool) $unit->a_aktif,
                'status' => $unit->a_aktif ? 'Aktif' : 'Tidak Aktif',
                'id_jns_lemb' => $unit->id_jns_lemb,
                'id_induk_organisasi' => $unit->id_induk_organisasi,
                'nm_induk_organisasi' => $unit->nm_induk_organisasi,
                'id_wil' => $unit->id_wil,
                'tgl_create' => $unit->tgl_create,
                'last_update' => $unit->last_update,
                'last_sync' => $unit->last_sync,
            ];
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::getDetail error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get all unit organisasi for dropdown
     *
     * @return array
     */
    public function getAll(): array
    {
        try {
            $data = $this->repository->getAll();

            return array_map(function ($item) {
                return [
                    'id_organisasi' => $item->id_organisasi,
                    'nm_lemb' => $item->nm_lemb,
                    'level_organisasi' => $item->level_organisasi,
                ];
            }, $data);
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::getAll error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get unit organisasi statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'total_unit' => (int) $stats->total_unit,
                'total_aktif' => (int) $stats->total_aktif,
                'total_nonaktif' => (int) $stats->total_nonaktif,
            ];
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new unit organisasi
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            if ($this->repository->nameExists($data['nm_lemb'])) {
                throw new \Exception('Nama unit organisasi sudah digunakan');
            }

            $id = $this->repository->create($data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::create error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update existing unit organisasi
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

            if ($this->repository->nameExists($data['nm_lemb'], $id)) {
                throw new \Exception('Nama unit organisasi sudah digunakan');
            }

            $this->repository->update($id, $data);

            return $this->getDetail($id);
        } catch (\Exception $e) {
            Log::error('UnitOrganisasiService::update error', [
                'message' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete unit organisasi (soft delete)
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
            Log::error('UnitOrganisasiService::delete error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }
}
