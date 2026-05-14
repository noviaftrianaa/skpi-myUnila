<?php

namespace App\Services\DataUnila;

use App\Repositories\DataUnila\DosenDataRepository;
use App\Services\CacheService;

class DosenDataService
{
    protected DosenDataRepository $repository;
    protected CacheService $cache;

    const TTL_LIST = 15;
    const TTL_DETAIL = 30;
    const TTL_STATS = 60;

    public function __construct()
    {
        $this->repository = new DosenDataRepository();
        $this->cache = new CacheService();
    }

    public function getList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'dosen-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getList($params));
    }

    public function getDetail(string $id): ?array
    {
        $key = $this->cache->buildKey('data-unila', 'dosen-detail', ['id' => $id]);
        return $this->cache->remember($key, self::TTL_DETAIL, function () use ($id) {
            $detail = $this->repository->getDetail($id);
            if (!$detail) return null;
            return [
                'biodata' => $detail,
                'riwayat_fungsional' => $this->repository->getRiwayatFungsional($id),
                'riwayat_pendidikan' => $this->repository->getRiwayatPendidikan($id),
                'sertifikasi' => $this->repository->getSertifikasi($id),
                'riwayat_kepangkatan' => $this->repository->getRiwayatKepangkatan($id),
                'tugas_tambahan' => $this->repository->getTugasTambahan($id),
            ];
        });
    }

    public function getStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'dosen-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getStats($params));
    }

    public function getExport(array $params): array
    {
        return $this->repository->getExport($params);
    }

    public function getJabfungList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'jabfung-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getJabfungList($params));
    }

    public function getJabfungStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'jabfung-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getJabfungStats($params));
    }

    public function getSertifikasiList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'sertifikasi-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getSertifikasiList($params));
    }

    public function getSertifikasiStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'sertifikasi-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getSertifikasiStats($params));
    }

    public function getPendidikanList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'pendidikan-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getPendidikanList($params));
    }

    public function getPendidikanStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'pendidikan-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getPendidikanStats($params));
    }

    public function getKepangkatanList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'kepangkatan-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getKepangkatanList($params));
    }

    public function getKepangkatanStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'kepangkatan-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getKepangkatanStats($params));
    }

    public function getTugasTambahanList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'tugas-tambahan-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getTugasTambahanList($params));
    }

    public function getTugasTambahanStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'tugas-tambahan-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getTugasTambahanStats($params));
    }
}
