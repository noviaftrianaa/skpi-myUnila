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
}
