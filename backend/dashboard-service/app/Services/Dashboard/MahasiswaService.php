<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\MahasiswaRepository;
use App\Services\CacheService;

class MahasiswaService
{
    protected MahasiswaRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new MahasiswaRepository();
        $this->cache = new CacheService();
    }

    /**
     * Get all dashboard mahasiswa data
     */
    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];

        $key = $this->cache->buildKey('mahasiswa', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            // Use prodi instead of fakultas when prodi is specified
            $effFak = $prodi ? null : $fakultas;

            return [
                'stats'                => $this->buildStats($semesters, $effFak),
                'trendMahasiswa'       => $this->buildTrend($semesters, $effFak),
                'trendMahasiswaBaru'   => $this->buildSimpleList($this->repository->getTrendMahasiswaBaru($semesters, $effFak)),
                'sebaranFakultas'      => $this->buildSebaranFakultas($semesters),
                'distribusiJenjang'    => $this->buildSimpleList($this->repository->getDistribusiJenjang($semesters, $effFak)),
                'jalurMasuk'           => $this->buildSimpleList($this->repository->getJalurMasuk($semesters, $effFak)),
                'pembiayaan'           => $this->buildSimpleList($this->repository->getPembiayaan($semesters, $effFak)),
                'distribusiIPK'        => $this->buildSimpleList($this->repository->getDistribusiIPK($semesters, $effFak)),
                'ipkPerFakultas'       => $this->buildIPKFakultas($semesters),
                'masaStudi'            => $this->buildSimpleList($this->repository->getMasaStudi($semesters, $effFak)),
                'beasiswa'             => $this->buildSimpleList($this->repository->getBeasiswa($semesters, $effFak)),
                'tugasAkhir'           => $this->buildSimpleList($this->repository->getTugasAkhir($semesters)),
                'asalProvinsi'         => $this->buildSimpleList($this->repository->getAsalProvinsi($semesters, $effFak)),
                'mahasiswaAsing'       => $this->buildSimpleList($this->repository->getMahasiswaAsing($semesters)),
                'warningMasaStudi'     => $this->buildSimpleList($this->repository->getWarningMasaStudi()),
                'genderDistribusi'     => $this->buildSimpleList($this->repository->getGenderDistribusi($semesters, $effFak)),
                'statusMahasiswa'      => $this->buildSimpleList($this->repository->getStatusMahasiswa($semesters, $effFak)),
                'rasioDosenMahasiswa'  => $this->buildSimpleList($this->repository->getRasioDosenMahasiswa($semesters)),
            ];
        });
    }

    /**
     * Build stats with YoY trend
     */
    private function buildStats(array $semesters, ?string $fakultas): array
    {
        $prevSemesters = $this->repository->getPreviousSemesters($semesters);

        // Current semesters counts
        $aktif = $this->repository->countAktif($semesters, $fakultas);
        $baru  = $this->repository->countBaru($semesters, $fakultas);
        $lulus = $this->repository->countLulus($semesters, $fakultas);
        $cuti  = $this->repository->countCuti($semesters, $fakultas);
        $do    = $this->repository->countDO($semesters, $fakultas);

        // Previous semesters counts (for trend)
        $prevAktif = $this->repository->countAktif($prevSemesters, $fakultas);
        $prevBaru  = $this->repository->countBaru($prevSemesters, $fakultas);
        $prevLulus = $this->repository->countLulus($prevSemesters, $fakultas);
        $prevCuti  = $this->repository->countCuti($prevSemesters, $fakultas);
        $prevDO    = $this->repository->countDO($prevSemesters, $fakultas);

        return [
            'aktif' => [
                'total' => $aktif,
                'trend' => $this->repository->calculateTrend($aktif, $prevAktif),
            ],
            'baru' => [
                'total' => $baru,
                'trend' => $this->repository->calculateTrend($baru, $prevBaru),
            ],
            'lulus' => [
                'total' => $lulus,
                'trend' => $this->repository->calculateTrend($lulus, $prevLulus),
            ],
            'cuti' => [
                'total' => $cuti,
                'trend' => $this->repository->calculateTrend($cuti, $prevCuti),
            ],
            'do' => [
                'total' => $do,
                'trend' => $this->repository->calculateTrend($do, $prevDO),
            ],
        ];
    }

    /**
     * Build trend data (5 years)
     */
    private function buildTrend(array $semesters, ?string $fakultas): array
    {
        $results = $this->repository->getTrend($semesters, $fakultas);
        return array_map(function ($item) {
            return [
                'name'  => (string) $item->name,
                'value' => (int) $item->value,
            ];
        }, $results);
    }

    /**
     * Build sebaran fakultas with prodi drilldown
     */
    private function buildSebaranFakultas(array $semesters): array
    {
        $fakultasList = $this->repository->getSebaranFakultas($semesters);

        return array_map(function ($fak) use ($semesters) {
            $prodiList = $this->repository->getSebaranProdi($fak->id, $semesters);

            return [
                'id'       => (string) $fak->id,
                'name'     => (string) $fak->name,
                'value'    => (int) $fak->value,
                'children' => array_map(function ($prodi) {
                    return [
                        'id'    => (string) $prodi->id,
                        'name'  => (string) $prodi->name,
                        'value' => (int) $prodi->value,
                    ];
                }, $prodiList),
            ];
        }, $fakultasList);
    }

    /**
     * Build IPK per fakultas (with float values)
     */
    private function buildIPKFakultas(array $semesters): array
    {
        $results = $this->repository->getIPKPerFakultas($semesters);
        return array_map(function ($item) {
            return [
                'name'  => (string) $item->name,
                'value' => round((float) $item->value, 2),
            ];
        }, $results);
    }

    /**
     * Build simple list [{name, value}]
     */
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
