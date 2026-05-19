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
        $prodi    = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];

        $key = $this->cache->buildKey('mahasiswa', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            return [
                'stats'                => $this->buildStats($semesters, $fakultas, $prodi),
                'trendMahasiswa'       => $this->buildTrend($semesters, $fakultas, $prodi),
                'trendMahasiswaBaru'   => $this->buildSimpleList($this->repository->getTrendMahasiswaBaru($semesters, $fakultas, $prodi)),
                // sebaranFakultas: aggregate breakdown — TIDAK narrow.
                'sebaranFakultas'      => $this->buildSebaranFakultas($semesters, $fakultas, $prodi),
                'distribusiJenjang'    => $this->buildSimpleList($this->repository->getDistribusiJenjang($semesters, $fakultas, $prodi)),
                'jalurMasuk'           => $this->buildSimpleList($this->repository->getJalurMasuk($semesters, $fakultas, $prodi)),
                'pembiayaan'           => $this->buildSimpleList($this->repository->getPembiayaan($semesters, $fakultas, $prodi)),
                'distribusiIPK'        => $this->buildSimpleList($this->repository->getDistribusiIPK($semesters, $fakultas, $prodi)),
                'ipkPerFakultas'       => $this->buildIPKFakultas($semesters, $fakultas, $prodi),
                'masaStudi'            => $this->buildSimpleList($this->repository->getMasaStudi($semesters, $fakultas, $prodi)),
                'beasiswa'             => $this->buildSimpleList($this->repository->getBeasiswa($semesters, $fakultas, $prodi)),
                'tugasAkhir'           => $this->buildSimpleList($this->repository->getTugasAkhir($semesters, $fakultas, $prodi)),
                'asalProvinsi'         => $this->buildSimpleList($this->repository->getAsalProvinsi($semesters, $fakultas, $prodi)),
                'mahasiswaAsing'       => $this->buildSimpleList($this->repository->getMahasiswaAsing($semesters)),
                'warningMasaStudi'     => $this->buildSimpleList($this->repository->getWarningMasaStudi()),
                'genderDistribusi'     => $this->buildSimpleList($this->repository->getGenderDistribusi($semesters, $fakultas, $prodi)),
                'statusMahasiswa'      => $this->buildSimpleList($this->repository->getStatusMahasiswa($semesters, $fakultas, $prodi)),
                'rasioDosenMahasiswa'  => $this->buildSimpleList($this->repository->getRasioDosenMahasiswa($semesters)),
            ];
        });
    }

    /**
     * Build stats with YoY trend
     */
    private function buildStats(array $semesters, ?string $fakultas, ?string $prodi): array
    {
        $prevSemesters = $this->repository->getPreviousSemesters($semesters);

        // Current semesters counts
        $aktif = $this->repository->countAktif($semesters, $fakultas, $prodi);
        $baru  = $this->repository->countBaru($semesters, $fakultas, $prodi);
        $lulus = $this->repository->countLulus($semesters, $fakultas, $prodi);
        $cuti  = $this->repository->countCuti($semesters, $fakultas, $prodi);
        $do    = $this->repository->countDO($semesters, $fakultas, $prodi);

        // Previous semesters counts (for trend)
        $prevAktif = $this->repository->countAktif($prevSemesters, $fakultas, $prodi);
        $prevBaru  = $this->repository->countBaru($prevSemesters, $fakultas, $prodi);
        $prevLulus = $this->repository->countLulus($prevSemesters, $fakultas, $prodi);
        $prevCuti  = $this->repository->countCuti($prevSemesters, $fakultas, $prodi);
        $prevDO    = $this->repository->countDO($prevSemesters, $fakultas, $prodi);

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
    private function buildTrend(array $semesters, ?string $fakultas, ?string $prodi): array
    {
        $results = $this->repository->getTrend($semesters, $fakultas, $prodi);
        return array_map(function ($item) {
            return [
                'name'  => (string) $item->name,
                'value' => (int) $item->value,
            ];
        }, $results);
    }

    /**
     * Build sebaran fakultas with prodi drilldown.
     * Sebaran fakultas berfungsi sbg breakdown univ. Kalau scope ke 1 fakultas,
     * tampilkan prodi langsung sebagai root (skip level fakultas).
     */
    private function buildSebaranFakultas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $fakultasList = $this->repository->getSebaranFakultas($semesters, $fakultas, $prodi);

        return array_map(function ($fak) use ($semesters, $fakultas, $prodi) {
            $prodiList = $this->repository->getSebaranProdi($fak->id, $semesters, $prodi);

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
    private function buildIPKFakultas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $results = $this->repository->getIPKPerFakultas($semesters, $fakultas, $prodi);
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
