<?php

namespace App\Services\DataUnila;

use App\Repositories\DataUnila\TridarmaDataRepository;
use App\Services\CacheService;

class TridarmaDataService
{
    protected TridarmaDataRepository $repository;
    protected CacheService $cache;

    const TTL_LIST = 15;
    const TTL_STATS = 60;

    public function __construct()
    {
        $this->repository = new TridarmaDataRepository();
        $this->cache = new CacheService();
    }

    public function getLitabmas(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'litabmas-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getLitabmasList($params));
    }

    public function getLitabmasStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'litabmas-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getLitabmasStats($params));
    }

    public function getLitabmasAnggota(string $idLitabmas, int $mhsLimit = 100, int $mhsOffset = 0): array
    {
        $key = $this->cache->buildKey('data-unila', 'litabmas-anggota', [
            'id' => $idLitabmas, 'limit' => $mhsLimit, 'offset' => $mhsOffset,
        ]);
        return $this->cache->remember($key, self::TTL_STATS, fn() =>
            $this->repository->getLitabmasAnggota($idLitabmas, $mhsLimit, $mhsOffset)
        );
    }

    public function getPublikasi(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'publikasi-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getPublikasiList($params));
    }

    public function getPublikasiStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'publikasi-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getPublikasiStats($params));
    }

    public function getPublikasiPenulis(string $idPublikasi): array
    {
        $key = $this->cache->buildKey('data-unila', 'publikasi-penulis', ['id' => $idPublikasi]);
        return $this->cache->remember($key, self::TTL_STATS, fn() =>
            $this->repository->getPublikasiPenulis($idPublikasi)
        );
    }

    public function getPrestasi(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'prestasi-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getPrestasiList($params));
    }

    public function getPrestasiStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'prestasi-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getPrestasiStats($params));
    }

    public function getPrestasiAnggota(string $idPrestasi): array
    {
        $key = $this->cache->buildKey('data-unila', 'prestasi-anggota', ['id' => $idPrestasi]);
        return $this->cache->remember($key, self::TTL_STATS, fn() =>
            $this->repository->getPrestasiAnggota($idPrestasi)
        );
    }

    public function getPengajaran(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'pengajaran-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getPengajaranList($params));
    }

    public function getPengajaranStats(array $params = []): array
    {
        $key = $this->cache->buildKey('data-unila', 'pengajaran-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getPengajaranStats($params));
    }
}
