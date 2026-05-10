<?php
namespace App\Services\DataUnila;

use App\Repositories\DataUnila\KknDataRepository;
use App\Services\CacheService;

class KknDataService
{
    protected KknDataRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new KknDataRepository();
        $this->cache = new CacheService();
    }

    public function getKknList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'kkn-list', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getKknList($params));
    }

    public function getKknStats(): array
    {
        return $this->cache->remember('data-unila:kkn-stats', 60, fn() => $this->repository->getKknStats());
    }

    public function getPeriodeList(): array
    {
        return $this->cache->remember('data-unila:kkn-periode-list', 300, fn() => $this->repository->getPeriodeList());
    }
}
