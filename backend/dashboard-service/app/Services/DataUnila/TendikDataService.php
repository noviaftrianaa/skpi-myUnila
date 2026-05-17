<?php

namespace App\Services\DataUnila;

use App\Repositories\DataUnila\TendikDataRepository;
use App\Services\CacheService;

class TendikDataService
{
    protected TendikDataRepository $repository;
    protected CacheService $cache;

    const TTL_LIST = 30;
    const TTL_STATS = 120;
    const TTL_FILTERS = 600;

    public function __construct()
    {
        $this->repository = new TendikDataRepository();
        $this->cache = new CacheService();
    }

    public function getList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'tendik-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getList($params));
    }

    public function getStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'tendik-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getStats($params));
    }

    public function getFilterOptions(): array
    {
        return $this->cache->remember('data-unila:tendik-filters', self::TTL_FILTERS, fn() => $this->repository->getFilterOptions());
    }
}
