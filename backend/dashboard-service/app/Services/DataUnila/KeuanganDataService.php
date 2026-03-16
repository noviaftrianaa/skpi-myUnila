<?php

namespace App\Services\DataUnila;

use App\Repositories\DataUnila\KeuanganDataRepository;
use App\Services\CacheService;

class KeuanganDataService
{
    protected KeuanganDataRepository $repository;
    protected CacheService $cache;

    const TTL_LIST   = 15;
    const TTL_STATS  = 60;
    const TTL_FILTER = 1440;

    public function __construct()
    {
        $this->repository = new KeuanganDataRepository();
        $this->cache = new CacheService();
    }

    // ---- UKT ----

    public function getUktList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'keuangan-ukt-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getUktList($params));
    }

    public function getUktStats(): array
    {
        $key = 'data-unila:keuangan-ukt-stats';
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getUktStats());
    }

    public function getUktTahunList(): array
    {
        $key = 'data-unila:keuangan-ukt-tahun';
        return $this->cache->remember($key, self::TTL_FILTER, fn() => $this->repository->getUktTahunList());
    }

    // ---- SPP ----

    public function getSppList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'keuangan-spp-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getSppList($params));
    }

    public function getSppStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'keuangan-spp-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getSppStats($params));
    }

    public function getSppTahunList(): array
    {
        $key = 'data-unila:keuangan-spp-tahun';
        return $this->cache->remember($key, self::TTL_FILTER, fn() => $this->repository->getSppTahunList());
    }
}
