<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\PrestasiRepository;
use App\Services\CacheService;

class PrestasiService
{
    protected PrestasiRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new PrestasiRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi    = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];
        $key = $this->cache->buildKey('prestasi', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);

            $total = $this->repository->countTotalPrestasi($semesters, $fakultas, $prodi);
            $prevTotal = $this->repository->countTotalPrestasi($prevSemesters, $fakultas, $prodi);

            $nasional = $this->repository->countByTingkat($semesters, 5, $fakultas, $prodi);
            $prevNasional = $this->repository->countByTingkat($prevSemesters, 5, $fakultas, $prodi);

            $internasional = $this->repository->countByTingkat($semesters, 6, $fakultas, $prodi);
            $prevInternasional = $this->repository->countByTingkat($prevSemesters, 6, $fakultas, $prodi);

            $publikasi = $this->repository->countPublikasi($semesters);
            $prevPublikasi = $this->repository->countPublikasi($prevSemesters);

            return [
                'stats' => [
                    'total'          => ['total' => $total, 'trend' => $this->repository->calculateTrend($total, $prevTotal)],
                    'nasional'       => ['total' => $nasional, 'trend' => $this->repository->calculateTrend($nasional, $prevNasional)],
                    'internasional'  => ['total' => $internasional, 'trend' => $this->repository->calculateTrend($internasional, $prevInternasional)],
                    'publikasi'      => ['total' => $publikasi, 'trend' => $this->repository->calculateTrend($publikasi, $prevPublikasi)],
                ],
                'trendPrestasi'      => $this->buildSimpleList($this->repository->getTrendPrestasi($semesters, $fakultas, $prodi)),
                'prestasiPerTingkat' => $this->buildCategoryList($this->repository->getPrestasiPerTingkat($semesters, $fakultas, $prodi)),
                'jenisPrestasi'      => $this->buildSimpleList($this->repository->getJenisPrestasi($semesters, $fakultas, $prodi)),
                'topProdiPrestasi'   => $this->buildSimpleList($this->repository->getTopProdi($semesters, $fakultas, $prodi)),
                // prestasiPerFakultas: tetap aggregate per fakultas (tidak narrow ke single fak) supaya drill-down breakdown tetap kelihatan
                'prestasiPerFakultas'=> $this->buildSimpleList($this->repository->getPerFakultas($semesters)),
                'mahasiswaVsDosen'   => [
                    ['name' => 'Mahasiswa', 'value' => $this->repository->countPrestasiMahasiswa($semesters)],
                    ['name' => 'Dosen', 'value' => 0],
                ],
                'trendPublikasi'     => $this->buildSimpleList($this->repository->getTrendPublikasi($semesters)),
                'jenisPublikasi'     => $this->buildSimpleList($this->repository->getJenisPublikasi($semesters)),
                'hkiPerFakultas'     => $this->buildSimpleList($this->repository->getHkiPerFakultas($semesters)),
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
