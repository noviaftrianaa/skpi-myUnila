<?php
namespace App\Services\DataUnila;
use App\Repositories\DataUnila\KerjasamaDataRepository;
use App\Services\CacheService;

class KerjasamaDataService
{
    protected KerjasamaDataRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new KerjasamaDataRepository();
        $this->cache = new CacheService();
    }

    public function getList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'kerjasama-list', $params);
        return $this->cache->remember($key, 15, fn() => $this->repository->getList($params));
    }

    public function getStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'kerjasama-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getStats($params));
    }

    public function getMitraList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'mitra-list', $params);
        return $this->cache->remember($key, 15, fn() => $this->repository->getMitraList($params));
    }

    public function getMitraStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'mitra-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getMitraStats($params));
    }
}
