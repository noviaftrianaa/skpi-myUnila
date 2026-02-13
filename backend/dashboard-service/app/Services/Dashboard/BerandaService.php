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
        $key = $this->cache->buildKey('beranda', 'full', ['semester' => implode(',', $semesters)]);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);

            $mhsAktif = $this->repository->countMahasiswaAktif();
            $dosen = $this->repository->countDosen();
            $tendik = $this->repository->countTendik();
            $totalSdm = $dosen + $tendik;

            $pendapatan = $this->repository->getTotalPendapatanUKT($semesters);
            $prevPendapatan = $this->repository->getTotalPendapatanUKT($prevSemesters);

            return [
                'summaryStats' => [
                    'mahasiswa' => [
                        'total'  => $this->repository->countTotalMahasiswa(),
                        'trend'  => 0,
                        'active' => $mhsAktif,
                        'cuti'   => $this->repository->countMahasiswaCuti(),
                    ],
                    'sdm' => [
                        'total'  => $totalSdm,
                        'trend'  => 0,
                        'dosen'  => $dosen,
                        'tendik' => $tendik,
                    ],
                    'akademik' => [
                        'prodi'             => $this->repository->countProdiAktif(),
                        'akrUnggul'         => $this->repository->countProdiUnggul(),
                        'akrInternasional'  => $this->repository->countAkreditasiInternasional(),
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
                'populasiTrend'  => $this->buildCategoryList($this->repository->getPopulasiTrend($semesters)),
                'akreditasiDist' => $this->buildSimpleList($this->repository->getAkreditasiDist()),
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
