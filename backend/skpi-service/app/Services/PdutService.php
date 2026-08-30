<?php

namespace App\Services;

use App\Repositories\PdutRepository;

class PdutService
{
    protected PdutRepository $pdutRepository;

    public function __construct(PdutRepository $pdutRepository)
    {
        $this->pdutRepository = $pdutRepository;
    }

    /**
     * Ambil data mahasiswa berdasarkan NIM
     */
    public function getMahasiswa(string $nim): ?object
    {
        return $this->pdutRepository->getMahasiswaByNim($nim);
    }

    /**
     * Cari mahasiswa
     */
    public function searchMahasiswa(string $keyword): array
    {
        return $this->pdutRepository->searchMahasiswa($keyword);
    }

    /**
     * Ambil data dosen berdasarkan NIDN
     */
    public function getDosen(string $nidn): ?object
    {
        return $this->pdutRepository->getDosenByNidn($nidn);
    }

    /**
     * Ambil seluruh Admin Prodi
     */
    public function getAdminProdi(): array
    {
        return $this->pdutRepository->getAdminProdi();
    }
}