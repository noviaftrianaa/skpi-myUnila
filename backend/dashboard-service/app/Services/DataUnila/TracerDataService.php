<?php
namespace App\Services\DataUnila;
use App\Repositories\DataUnila\TracerDataRepository;
use App\Services\CacheService;

class TracerDataService
{
    protected TracerDataRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new TracerDataRepository();
        $this->cache = new CacheService();
    }

    public function getList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'tracer-list', $params);
        return $this->cache->remember($key, 15, fn() => $this->repository->getList($params));
    }

    public function getStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'tracer-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getStats($params));
    }
}
