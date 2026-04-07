<?php

namespace App\Services\Dashboard;

use App\Repositories\ReferenceRepository;
use App\Services\CacheService;

class ReferenceService
{
    protected ReferenceRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new ReferenceRepository();
        $this->cache = new CacheService();
    }

    /**
     * Get fakultas list (cached)
     */
    public function getFakultasList(): array
    {
        $key = $this->cache->buildKey('reference', 'fakultas');

        return $this->cache->remember($key, CacheService::TTL_REFERENCE, function () {
            $results = $this->repository->getFakultasList();
            return array_map(function ($item) {
                return [
                    'id'   => $item->id,
                    'nama' => $item->nama,
                ];
            }, $results);
        });
    }

    /**
     * Get prodi list (cached per fakultas)
     */
    public function getProdiList(?string $idFakultas = null): array
    {
        $key = $this->cache->buildKey('reference', 'prodi', ['fakultas' => $idFakultas]);

        return $this->cache->remember($key, CacheService::TTL_REFERENCE, function () use ($idFakultas) {
            $results = $this->repository->getProdiList($idFakultas);
            return array_map(function ($item) {
                return [
                    'id'          => $item->id,
                    'nama'        => $item->nama,
                    'jenjang'     => $item->jenjang,
                    'id_fakultas' => $item->id_fakultas,
                ];
            }, $results);
        });
    }

    /**
     * Get semester/tahun list (cached)
     */
    public function getSemesterList(): array
    {
        $key = $this->cache->buildKey('reference', 'semester');

        return $this->cache->remember($key, CacheService::TTL_REFERENCE, function () {
            $results = $this->repository->getSemesterList();
            return array_map(function ($item) {
                $year = substr($item->id_smt, 0, 4);
                $smtDigit = substr($item->id_smt, 4, 1);
                $smtName = $smtDigit === '1' ? 'Ganjil' : ($smtDigit === '2' ? 'Genap' : 'Pendek');
                return [
                    'id_smt' => $item->id_smt,
                    'label'  => $year . '/' . ((int) $year + 1) . ' ' . $smtName,
                    'tahun'  => $year,
                    'aktif'  => (bool) $item->a_periode_aktif,
                ];
            }, $results);
        });
    }
}
