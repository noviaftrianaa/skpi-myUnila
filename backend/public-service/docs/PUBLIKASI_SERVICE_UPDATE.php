<?php

/**
 * UPDATED METHOD FOR PublikasiService.php
 * Replace the existing getPublikasiStatistics() method with this one
 */

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
    $total = $this->publikasiRepository->getTotalPublikasi();

    return [
        'total' => $total,
        'by_jenis' => $byJenis,
        'by_year' => $byYear,
        'by_kategori_capaian' => $byKategoriCapaian,
        'by_peran' => $byPeran,
    ];
}
