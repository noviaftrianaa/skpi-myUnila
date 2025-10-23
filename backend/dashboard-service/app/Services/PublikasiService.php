<?php

namespace App\Services;

use App\Repositories\PublikasiRepository;

class PublikasiService
{
    protected $publikasiRepository;

    public function __construct(PublikasiRepository $publikasiRepository)
    {
        $this->publikasiRepository = $publikasiRepository;
    }

    /**
     * Get publikasi statistics
     *
     * @param int|null $startYear Start year for filtering
     * @param int|null $endYear End year for filtering
     * @return array Publikasi statistics data
     */
    public function getPublikasiStatistics(?int $startYear = null, ?int $endYear = null): array
    {
        $byJenis = $this->publikasiRepository->getPublikasiByJenis();
        $byYear = $this->publikasiRepository->getPublikasiByYear();
        $byKategoriCapaian = $this->publikasiRepository->getPublikasiByKategoriCapaian($startYear, $endYear);
        $byPeran = $this->publikasiRepository->getPublikasiByPeran($startYear, $endYear);
        $byFakultas = $this->publikasiRepository->getPublikasiByFakultas($startYear, $endYear);
        $total = $this->publikasiRepository->getTotalPublikasi();

        return [
            'total' => $total,
            'by_jenis' => $byJenis,
            'by_year' => $byYear,
            'by_kategori_capaian' => $byKategoriCapaian,
            'by_peran' => $byPeran,
            'by_fakultas' => $byFakultas,
        ];
    }
}
