<?php
namespace App\Services\DataUnila;
use App\Repositories\DataUnila\AkademikDataRepository;
use App\Services\CacheService;

class AkademikDataService
{
    protected AkademikDataRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new AkademikDataRepository();
        $this->cache = new CacheService();
    }

    public function getProdiList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'prodi-list', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getProdiList($params));
    }

    public function getAkreditasiList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'akreditasi-list', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getAkreditasiList($params));
    }

    public function getMatkulList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'matkul-list', $params);
        return $this->cache->remember($key, 15, fn() => $this->repository->getMatkulList($params));
    }

    public function getProdiStats(): array
    {
        return $this->cache->remember('data-unila:prodi-stats', 60, fn() => $this->repository->getProdiStats());
    }

    public function getAkreditasiStats(): array
    {
        return $this->cache->remember('data-unila:akreditasi-stats', 60, fn() => $this->repository->getAkreditasiStats());
    }

    public function getMatkulStats(): array
    {
        return $this->cache->remember('data-unila:matkul-stats', 60, fn() => $this->repository->getMatkulStats());
    }
}
