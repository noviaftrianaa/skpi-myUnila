<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\AkreditasiRepository;
use App\Services\CacheService;

class AkreditasiService
{
    protected AkreditasiRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new AkreditasiRepository();
        $this->cache = new CacheService();
    }

    /**
     * Get all dashboard akreditasi data
     */
    public function getData(array $params): array
    {
        $key = $this->cache->buildKey('akreditasi', 'full', []);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () {
            return [
                'stats'                  => $this->buildStats(),
                'distribusiAkreditasi'   => $this->buildSimpleList($this->repository->getDistribusiPeringkat()),
                'statusKadaluarsa'       => $this->buildSimpleList($this->repository->getStatusKadaluarsa()),
                'sebaranFakultas'        => $this->buildSebaranFakultas(),
                'akreditasiPerFakultas'  => $this->buildCategoryList($this->repository->getAllPerFakultas()),
                'internasional'          => $this->buildSimpleList($this->repository->getInternasional()),
                'internasionalDetail'    => $this->buildInternasionalDetail($this->repository->getInternasionalDetail()),
                'expiringProdi'          => $this->buildDetailTable($this->repository->getExpiringProdi()),
                'detailTable'            => $this->buildDetailTable($this->repository->getDetailTable()),
            ];
        });
    }

    /**
     * Build stat cards
     */
    private function buildStats(): array
    {
        $totalProdi = $this->repository->countTotalProdi();
        $unggul     = $this->repository->countByPeringkat(['Unggul', 'A']);
        $baikSekali = $this->repository->countByPeringkat(['Baik Sekali', 'B']);
        $baik       = $this->repository->countByPeringkat(['Baik', 'C']);
        $intl       = $this->repository->countInternasional();

        return [
            'totalProdi'    => ['total' => $totalProdi],
            'unggul'        => ['total' => $unggul],
            'baikSekali'    => ['total' => $baikSekali],
            'baik'          => ['total' => $baik],
            'internasional' => ['total' => $intl],
        ];
    }

    /**
     * Build simple list [{name, value}]
     */
    private function buildSimpleList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name'  => (string) $item->name,
                'value' => (int) $item->value,
            ];
        }, $results);
    }

    /**
     * Build category list [{name, value, category}]
     */
    private function buildCategoryList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name'     => (string) $item->name,
                'value'    => (int) $item->value,
                'category' => (string) $item->category,
            ];
        }, $results);
    }

    /**
     * Build sebaran fakultas with drilldown children
     */
    private function buildSebaranFakultas(): array
    {
        $fakultasList = $this->repository->getSebaranFakultas();
        return array_map(function ($fak) {
            $prodiList = $this->repository->getSebaranProdi($fak->id);
            return [
                'id'       => (string) $fak->id,
                'name'     => (string) $fak->name,
                'value'    => (int) $fak->value,
                'children' => array_map(function ($p) {
                    return [
                        'id'    => (string) $p->id,
                        'name'  => (string) $p->name,
                        'value' => (int) $p->value,
                    ];
                }, $prodiList),
            ];
        }, $fakultasList);
    }

    /**
     * Build internasional detail [{prodi, fak, strata, lembaga, exp}]
     */
    private function buildInternasionalDetail(array $results): array
    {
        return array_map(function ($item) {
            return [
                'prodi'   => (string) $item->prodi,
                'fak'     => (string) $item->fak,
                'strata'  => (string) $item->strata,
                'lembaga' => (string) $item->lembaga,
                'exp'     => (string) $item->exp,
            ];
        }, $results);
    }

    /**
     * Build detail table [{prodi, fak, strata, rank, int, exp}]
     */
    private function buildDetailTable(array $results): array
    {
        return array_map(function ($item) {
            return [
                'prodi'  => (string) $item->prodi,
                'fak'    => (string) $item->fak,
                'strata' => (string) $item->strata,
                'rank'   => (string) $item->rank,
                'int'    => (string) $item->int,
                'exp'    => (string) $item->exp,
            ];
        }, $results);
    }
}
