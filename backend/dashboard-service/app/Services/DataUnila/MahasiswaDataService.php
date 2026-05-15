<?php

namespace App\Services\DataUnila;

use App\Repositories\DataUnila\MahasiswaDataRepository;
use App\Services\CacheService;

class MahasiswaDataService
{
    protected MahasiswaDataRepository $repository;
    protected CacheService $cache;

    // Cache TTL: raw data changes less frequently
    const TTL_LIST = 15;      // 15 minutes for paginated list
    const TTL_DETAIL = 30;    // 30 minutes for detail
    const TTL_STATS = 60;     // 1 hour for stats
    const TTL_FILTERS = 1440; // 24 hours for filter dropdowns

    public function __construct()
    {
        $this->repository = new MahasiswaDataRepository();
        $this->cache = new CacheService();
    }

    /**
     * Get paginated mahasiswa list
     */
    public function getList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'mahasiswa-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getList($params));
    }

    /**
     * Get mahasiswa detail
     */
    public function getDetail(string $idPd): ?object
    {
        $key = $this->cache->buildKey('data-unila', 'mahasiswa-detail', ['id' => $idPd]);
        return $this->cache->remember($key, self::TTL_DETAIL, fn() => $this->repository->getDetail($idPd));
    }

    /**
     * Get FULL profile (SIAKADU + PDDikti + keluarga + riwayat semester)
     */
    public function getFullProfile(string $idPd): array
    {
        $key = $this->cache->buildKey('data-unila', 'mahasiswa-full', ['id' => $idPd]);
        return $this->cache->remember($key, self::TTL_DETAIL, fn() => $this->repository->getFullProfile($idPd));
    }

    public function resolveByNim(string $nim): ?string
    {
        $key = $this->cache->buildKey('data-unila', 'mhs-resolve-nim', ['nim' => $nim]);
        return $this->cache->remember($key, 3600, fn() => $this->repository->resolveByNim($nim));
    }

    /**
     * Get stats summary
     */
    public function getStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'mahasiswa-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getStats($params));
    }

    /**
     * Get export data (no cache — large dataset, stream directly)
     */
    public function getExport(array $params): array
    {
        return $this->repository->getExport($params);
    }

    // ---- Lulusan ----

    public function getLulusanList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'lulusan-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getLulusanList($params));
    }

    public function getLulusanStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'lulusan-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getLulusanStats($params));
    }

    // ---- Aktivitas ----

    public function getAktivitasList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'aktivitas-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getAktivitasList($params));
    }

    public function getAktivitasStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'aktivitas-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getAktivitasStats($params));
    }

    // ---- Ujian ----

    public function getUjianList(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'ujian-list', $params);
        return $this->cache->remember($key, self::TTL_LIST, fn() => $this->repository->getUjianList($params));
    }

    public function getUjianStats(array $params): array
    {
        $key = $this->cache->buildKey('data-unila', 'ujian-stats', $params);
        return $this->cache->remember($key, self::TTL_STATS, fn() => $this->repository->getUjianStats($params));
    }

    public function getAktivitasFilterOptions(): array
    {
        return $this->cache->remember('data-unila:aktivitas-filters', self::TTL_FILTERS, fn() => $this->repository->getAktivitasFilterOptions());
    }

    /**
     * Get filter options (cached long)
     */
    public function getFilters(array $params): array
    {
        // Cache key MUST include id_fakultas+id_jurusan so prodi list isn't shared across scope
        $key = $this->cache->buildKey('data-unila', 'mahasiswa-filters', [
            'fak' => $params['id_fakultas'] ?? '_all',
            'jur' => $params['id_jurusan'] ?? '_all',
        ]);
        return $this->cache->remember($key, self::TTL_FILTERS, function () use ($params) {
            return [
                'angkatan' => $this->repository->getAngkatanList(),
                'fakultas' => $this->repository->getFakultasList(),
                'prodi' => $this->repository->getProdiList(
                    $params['id_fakultas'] ?? null,
                    $params['id_jurusan'] ?? null
                ),
                'jurusan' => $this->repository->getJurusanList($params['id_fakultas'] ?? null),
                'jalur_daftar' => $this->repository->getJalurDaftarList(),
                'jenis_keluar' => $this->repository->getJenisKeluarList(),
                'tahun_lulus' => $this->repository->getTahunLulusList(),
            ];
        });
    }
}
