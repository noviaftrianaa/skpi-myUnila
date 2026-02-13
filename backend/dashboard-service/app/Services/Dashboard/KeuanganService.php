<?php
namespace App\Services\Dashboard;

use App\Repositories\Dashboard\KeuanganRepository;
use App\Services\CacheService;

class KeuanganService
{
    protected KeuanganRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new KeuanganRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $key = $this->cache->buildKey('keuangan', 'full', ['semester' => implode(',', $semesters), 'fakultas' => $fakultas]);

        return $this->cache->remember($key, CacheService::TTL_KEUANGAN, function () use ($semesters) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);
            $pendapatan = $this->repository->getTotalPendapatanUKT($semesters);
            $prevPendapatan = $this->repository->getTotalPendapatanUKT($prevSemesters);
            $spp = $this->repository->getTotalTagihanSPP($semesters);
            $prevSpp = $this->repository->getTotalTagihanSPP($prevSemesters);

            return [
                'stats' => [
                    'pendapatan' => ['total' => $pendapatan, 'trend' => $this->repository->calculateTrend($pendapatan, $prevPendapatan)],
                    'spp' => ['total' => $spp, 'trend' => $this->repository->calculateTrend($spp, $prevSpp)],
                ],
                'trendPendapatanSPP' => $this->buildSimpleList($this->repository->getTrendPendapatan($semesters)),
                'komposisiPendapatan' => $this->buildSimpleList($this->repository->getKomposisiPerJalur($semesters)),
                'statusPembayaran' => $this->buildSimpleList($this->repository->getStatusPembayaran($semesters)),
                'pendapatanPerUKT' => $this->buildSimpleList($this->repository->getSebaranKelasUKT($semesters)),
                'tunggakanFakultas' => $this->buildSimpleList($this->repository->getTunggakanPerFakultas($semesters)),
            ];
        });
    }

    private function buildSimpleList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name' => (string) $item->name,
                'value' => is_numeric($item->value) ? (strpos((string) $item->value, '.') !== false ? (float) $item->value : (int) $item->value) : $item->value,
            ];
        }, $results);
    }
}
