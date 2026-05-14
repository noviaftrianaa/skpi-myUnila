<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\BerandaRepository;
use App\Services\CacheService;

class BerandaService
{
    protected BerandaRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new BerandaRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi    = $params['prodi'] ?? null;
        $key = $this->cache->buildKey('beranda', 'full', [
            'semester' => implode(',', $semesters),
            'fakultas' => $fakultas,
            'prodi'    => $prodi,
        ]);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);

            $mhsAktif = $this->repository->countMahasiswaAktif($fakultas, $prodi);
            $dosen = $this->repository->countDosen($fakultas, $prodi);
            $tendik = $this->repository->countTendik($fakultas, $prodi);
            $totalSdm = $dosen + $tendik;

            // UKT / pendapatan dan kerjasama bersifat institusional → tidak di-narrow per scope,
            // tetap menampilkan angka universitas (sesuai konvensi data Unila yang ada).
            $pendapatan = $this->repository->getTotalPendapatanUKT($semesters);
            $prevPendapatan = $this->repository->getTotalPendapatanUKT($prevSemesters);

            return [
                'summaryStats' => [
                    'mahasiswa' => [
                        'total'  => $this->repository->countTotalMahasiswa($fakultas, $prodi),
                        'trend'  => 0,
                        'active' => $mhsAktif,
                        'cuti'   => $this->repository->countMahasiswaCuti($fakultas, $prodi),
                    ],
                    'sdm' => [
                        'total'  => $totalSdm,
                        'trend'  => 0,
                        'dosen'  => $dosen,
                        'tendik' => $tendik,
                    ],
                    'akademik' => [
                        'prodi'             => $this->repository->countProdiAktif($fakultas, $prodi),
                        'akrUnggul'         => $this->repository->countProdiUnggul($fakultas, $prodi),
                        'akrInternasional'  => $this->repository->countAkreditasiInternasional($fakultas, $prodi),
                    ],
                    'keuangan' => [
                        'total'   => $pendapatan,
                        'trend'   => $this->repository->calculateTrend($pendapatan, $prevPendapatan),
                        'serapan' => 0,
                    ],
                    'penelitian' => [
                        'judul'     => $this->repository->countPenelitian($semesters),
                        'publikasi' => $this->repository->countPublikasi($semesters),
                    ],
                    'kerjasama' => [
                        'mitra' => $this->repository->countMitra(),
                        'mou'   => $this->repository->countMou(),
                    ],
                ],
                'populasiTrend'  => $this->buildCategoryList($this->repository->getPopulasiTrend($semesters, $fakultas, $prodi)),
                'akreditasiDist' => $this->buildSimpleList($this->repository->getAkreditasiDist($fakultas, $prodi)),
                // fakultasData: aggregate breakdown per fakultas — TIDAK narrow.
                'fakultasData'   => $this->buildCategoryList($this->repository->getFakultasData()),
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
}
