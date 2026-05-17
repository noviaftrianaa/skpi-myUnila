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
        $fakultas = $params['fakultas'] ?? null;
        $prodi = $params['prodi'] ?? null;
        $key = $this->cache->buildKey('akreditasi', 'full', ['fakultas' => $fakultas, 'prodi' => $prodi]);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($fakultas, $prodi) {
            return [
                'stats'                  => $this->buildStats($fakultas, $prodi),
                'distribusiAkreditasi'   => $this->buildSimpleList($this->repository->getDistribusiPeringkat($fakultas, $prodi)),
                'statusKadaluarsa'       => $this->buildSimpleList($this->repository->getStatusKadaluarsa($fakultas, $prodi)),
                // sebaranFakultas: tetap aggregate per fakultas (tidak narrow ke single fak) supaya drill-down breakdown tetap kelihatan
                'sebaranFakultas'        => $this->buildSebaranFakultas(),
                'akreditasiPerFakultas'  => $this->buildCategoryList($this->repository->getAllPerFakultas()),
                'internasional'          => $this->buildSimpleList($this->repository->getInternasional($fakultas, $prodi)),
                'internasionalDetail'    => $this->buildInternasionalDetail($this->repository->getInternasionalDetail($fakultas, $prodi)),
                'expiringProdi'          => $this->buildDetailTable($this->repository->getExpiringProdi($fakultas, $prodi)),
                'detailTable'            => $this->buildDetailTable($this->repository->getDetailTable($fakultas, $prodi)),
                'expiryCalendar'         => $this->buildExpiryCalendar($this->repository->getExpiryCalendar($fakultas, $prodi)),
            ];
        });
    }

    /**
     * Build expiry calendar [{year, month, expiring_count}]
     */
    private function buildExpiryCalendar(array $results): array
    {
        return array_map(function ($item) {
            return [
                'year'           => (int) $item->year,
                'month'          => (int) $item->month,
                'expiring_count' => (int) $item->expiring_count,
            ];
        }, $results);
    }

    /**
     * Build stat cards
     */
    private function buildStats(?string $fakultas = null, ?string $prodi = null): array
    {
        $totalProdi = $this->repository->countTotalProdi($fakultas, $prodi);
        $unggul     = $this->repository->countByPeringkat(['Unggul', 'A'], $fakultas, $prodi);
        $baikSekali = $this->repository->countByPeringkat(['Baik Sekali', 'B'], $fakultas, $prodi);
        $baik       = $this->repository->countByPeringkat(['Baik', 'C'], $fakultas, $prodi);
        $intl       = $this->repository->countInternasional($fakultas, $prodi);
        $akanExpire = $this->repository->countAkanExpire($fakultas, $prodi);
        $expired    = $this->repository->countExpired($fakultas, $prodi);

        return [
            'totalProdi'    => ['total' => $totalProdi],
            'unggul'        => ['total' => $unggul],
            'baikSekali'    => ['total' => $baikSekali],
            'baik'          => ['total' => $baik],
            'internasional' => ['total' => $intl],
            'akanExpire'    => ['total' => $akanExpire],
            'expired'       => ['total' => $expired],
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
                'no_sk'  => isset($item->no_sk) ? (string) $item->no_sk : null,
                'exp'    => (string) $item->exp,
            ];
        }, $results);
    }
}
