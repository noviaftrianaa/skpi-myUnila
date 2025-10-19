<?php

namespace App\Services;

use App\Repositories\UnilaStatisticsRepository;
use Illuminate\Support\Facades\Cache;

class UnilaStatisticsService
{
    protected $repository;

    public function __construct(UnilaStatisticsRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get Universitas Lampung statistics
     *
     * @return array
     */
    public function getUnilaStatistics(): array
    {
        $cacheKey = 'unila_statistics';

        return Cache::remember($cacheKey, 3600, function () {
            $stats = $this->repository->getUnilaStatistics();

            return [
                'mahasiswa_aktif' => $stats->mahasiswa_aktif,
                'dosen' => $stats->dosen,
                'tendik' => $stats->tendik,
                'fakultas' => $stats->fakultas,
                'pascasarjana' => $stats->pascasarjana,
                'program_studi' => $stats->program_studi,
                'guru_besar' => $stats->guru_besar,
                'publikasi' => $stats->publikasi,
                'periode' => $stats->periode,
            ];
        });
    }
}
