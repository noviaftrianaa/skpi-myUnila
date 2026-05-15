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

    public function getProdiStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'prodi-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getProdiStats($params));
    }

    public function getAkreditasiStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'akreditasi-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getAkreditasiStats($params));
    }

    public function getMatkulStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'matkul-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getMatkulStats($params));
    }

    public function getProdiDetail(string $idSms): array
    {
        $key = $this->cache->buildKey('data-unila', 'prodi-detail', ['id' => $idSms]);
        return $this->cache->remember($key, 300, fn() => $this->repository->getProdiDetail($idSms));
    }

    public function getKurikulumList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'kurikulum-list', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getKurikulumList($params));
    }

    public function getKurikulumStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'kurikulum-stats', $params);
        return $this->cache->remember($key, 60, fn() => $this->repository->getKurikulumStats($params));
    }
}
