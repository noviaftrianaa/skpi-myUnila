<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\LulusanRepository;
use App\Services\CacheService;

class LulusanService
{
    protected LulusanRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new LulusanRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi    = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];

        $key = $this->cache->buildKey('lulusan', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);

            $total = $this->repository->countLulusan($semesters, $fakultas, $prodi);
            $prevTotal = $this->repository->countLulusan($prevSemesters, $fakultas, $prodi);
            $tepatWaktu = $this->repository->getTepatWaktuPersen($semesters, $fakultas, $prodi);
            $prevTepatWaktu = $this->repository->getTepatWaktuPersen($prevSemesters, $fakultas, $prodi);
            $rataIPK = $this->repository->getRataIPK($semesters, $fakultas, $prodi);
            $prevRataIPK = $this->repository->getRataIPK($prevSemesters, $fakultas, $prodi);

            return [
                'stats' => [
                    'totalLulusan' => [
                        'total' => $total,
                        'trend' => $this->repository->calculateTrend($total, $prevTotal),
                    ],
                    'tepatWaktu' => [
                        'total' => $tepatWaktu . '%',
                        'trend' => round($tepatWaktu - $prevTepatWaktu, 1),
                    ],
                    'rataIPK' => [
                        'total' => (string) $rataIPK,
                        'trend' => round($rataIPK - $prevRataIPK, 2),
                    ],
                ],
                'trendKelulusan'     => $this->buildSimpleList($this->repository->getTrendKelulusan($semesters, $fakultas, $prodi)),
                'ketepatanWaktu'     => $this->buildSimpleList($this->repository->getKetepatanWaktu($semesters, $fakultas, $prodi)),
                'ipkLulusan'         => $this->buildSimpleList($this->repository->getDistribusiIPK($semesters, $fakultas, $prodi)),
                'tracerStudyStatus'  => $this->buildSimpleList($this->repository->getTracerStudyStatus($semesters, $fakultas, $prodi)),
                'masaTungguKerja'    => $this->buildSimpleList($this->repository->getMasaTungguKerja($semesters, $fakultas, $prodi)),
                'incomeDistribusi'   => $this->buildSimpleList($this->repository->getIncomeDistribusi($semesters, $fakultas, $prodi)),
                'kesesuaianBidang'   => $this->buildSimpleList($this->repository->getKesesuaianBidangKerja($semesters, $fakultas, $prodi)),
                // lulusanPerFakultas: aggregate breakdown — TIDAK narrow.
                'lulusanPerFakultas' => $this->buildSimpleList($this->repository->getLulusanPerFakultas($semesters)),
                'lulusanPerJenjang'  => $this->buildSimpleList($this->repository->getLulusanPerJenjang($semesters, $fakultas, $prodi)),
            ];
        });
    }

    private function buildSimpleList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name'  => (string) $item->name,
                'value' => is_numeric($item->value) ? (strpos((string) $item->value, '.') !== false ? (float) $item->value : (int) $item->value) : $item->value,
            ];
        }, $results);
    }
}
