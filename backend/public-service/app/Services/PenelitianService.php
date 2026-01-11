<?php

namespace App\Services;

use App\Repositories\PenelitianRepository;

class PenelitianService
{
    protected $penelitianRepository;

    public function __construct(PenelitianRepository $penelitianRepository)
    {
        $this->penelitianRepository = $penelitianRepository;
    }

    /**
     * Get penelitian statistics
     *
     * @param int|null $startYear Start year for filtering
     * @param int|null $endYear End year for filtering
     * @return array Penelitian statistics data
     */
    public function getPenelitianStatistics(?int $startYear = null, ?int $endYear = null): array
    {
        $byKategori = $this->penelitianRepository->getPenelitianByKategori();
        $byYear = $this->penelitianRepository->getPenelitianByYear();
        $byFunding = $this->penelitianRepository->getPenelitianFundingByYear($startYear, $endYear);
        $byKelompokBidang = $this->penelitianRepository->getPenelitianByKelompokBidang($startYear, $endYear);
        $byFakultas = $this->penelitianRepository->getPenelitianByFakultas($startYear, $endYear);
        $total = $this->penelitianRepository->getTotalPenelitian();

        return [
            'total' => $total,
            'by_kategori' => $byKategori,
            'by_year' => $byYear,
            'by_funding' => $byFunding,
            'by_kelompok_bidang' => $byKelompokBidang,
            'by_fakultas' => $byFakultas,
        ];
    }
}
