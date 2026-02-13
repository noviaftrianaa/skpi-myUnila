<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\DosenRepository;
use App\Services\CacheService;

class DosenService
{
    protected DosenRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new DosenRepository();
        $this->cache = new CacheService();
    }

    /**
     * Get all dashboard dosen data
     */
    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas];

        $key = $this->cache->buildKey('dosen', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas) {
            return [
                'stats'                    => $this->buildStats($fakultas),
                'jenjangPendidikan'        => $this->buildSimpleList($this->repository->getJenjangPendidikan($fakultas)),
                'sebaranFakultas'          => $this->buildSebaranFakultas(),
                'heatmapPendidikanJabfung' => $this->buildHeatmapList($this->repository->getHeatmapPendidikanJabfung($fakultas)),
                'heatmapUsiaJabfung'       => $this->buildHeatmapList($this->repository->getHeatmapUsiaJabfung($fakultas)),
                'ikatanKerja'              => $this->buildSimpleList($this->repository->getIkatanKerja($fakultas)),
                'genderUsia'               => $this->buildGenderList($this->repository->getGenderUsia($fakultas)),
                'sertifikasiJabfung'       => $this->buildSertifikasiList($this->repository->getSertifikasiJabfung($fakultas)),
                'trendSertifikasi'         => $this->buildSimpleList($this->repository->getTrenSertifikasi($semesters)),
                'trendJabfung'             => $this->buildCategoryList($this->repository->getTrenJabfung($semesters)),
            ];
        });
    }

    /**
     * Build stat cards
     */
    private function buildStats(?string $fakultas): array
    {
        return [
            'total'     => $this->repository->countTotal($fakultas),
            'guruBesar' => $this->repository->countGuruBesar($fakultas),
            'doktor'    => $this->repository->countDoktor($fakultas),
            'rasio'     => $this->repository->getRasio($fakultas),
        ];
    }

    /**
     * Build sebaran fakultas with prodi drilldown
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

    /**
     * Clean jabfung name: strip credit points like "Lektor (200.00)" → "Lektor"
     * Also normalize "Profesor" → "Guru Besar"
     */
    private function cleanJabfungName(string $name): string
    {
        // Strip credit points in parentheses
        $clean = preg_replace('/\s*\(\d+[\.,]\d+\)/', '', $name);
        $clean = trim($clean);

        // Normalize Profesor to Guru Besar for frontend display
        if (stripos($clean, 'Profesor') !== false) {
            return 'Guru Besar';
        }

        return $clean;
    }

    /**
     * Build heatmap list [{x, y, value}]
     * Cleans jabfung names (x axis) and aggregates duplicates after cleaning
     */
    private function buildHeatmapList(array $results): array
    {
        $aggregated = [];
        foreach ($results as $item) {
            $x = $this->cleanJabfungName((string) $item->x);
            $y = (string) $item->y;
            $key = "{$x}|{$y}";

            if (!isset($aggregated[$key])) {
                $aggregated[$key] = ['x' => $x, 'y' => $y, 'value' => 0];
            }
            $aggregated[$key]['value'] += (int) $item->value;
        }
        return array_values($aggregated);
    }

    /**
     * Build gender/age pyramid list [{ageGroup, male, female}]
     */
    private function buildGenderList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'ageGroup' => (string) $item->ageGroup,
                'male'     => (int) $item->male,
                'female'   => (int) $item->female,
            ];
        }, $results);
    }

    /**
     * Build sertifikasi per jabfung list
     * Transforms: [{jabfung, sudah, belum}] → [{name, value, category}] (two entries per jabfung)
     * Aggregates after cleaning jabfung names
     */
    private function buildSertifikasiList(array $results): array
    {
        // Aggregate by cleaned jabfung name
        $aggregated = [];
        foreach ($results as $item) {
            $name = $this->cleanJabfungName((string) $item->jabfung);
            if (!isset($aggregated[$name])) {
                $aggregated[$name] = ['sudah' => 0, 'belum' => 0];
            }
            $aggregated[$name]['sudah'] += (int) $item->sudah;
            $aggregated[$name]['belum'] += (int) $item->belum;
        }

        $output = [];
        foreach ($aggregated as $name => $counts) {
            $output[] = [
                'name'     => $name,
                'value'    => $counts['sudah'],
                'category' => 'Sudah Serdos',
            ];
            $output[] = [
                'name'     => $name,
                'value'    => $counts['belum'],
                'category' => 'Belum Serdos',
            ];
        }
        return $output;
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
}
