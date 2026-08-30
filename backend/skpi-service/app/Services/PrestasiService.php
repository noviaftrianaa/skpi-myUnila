<?php

namespace App\Services;

use App\Repositories\PrestasiRepository;
use App\Repositories\BobotRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class PrestasiService
{
    protected PrestasiRepository $prestasiRepository;
    protected BobotRepository $bobotRepository;

    public function __construct(
        PrestasiRepository $prestasiRepository,
        BobotRepository $bobotRepository
    ) {
        $this->prestasiRepository = $prestasiRepository;
        $this->bobotRepository = $bobotRepository;
    }

    /**
     * Dashboard Mahasiswa
     */
    public function getDashboard(string $nim): array
    {
        $total = $this->prestasiRepository->getTotalBobot($nim);

        return [
            'total_skp' => $total,
            'predikat'  => $this->getPredikat($total),
            'prestasi'  => $this->prestasiRepository->getByNim($nim),
        ];
    }

    /**
     * List Prestasi
     */
    public function getByNim(string $nim)
    {
        return $this->prestasiRepository->getByNim($nim);
    }

    /**
     * Detail Prestasi
     */
    public function find(int $id)
    {
        return $this->prestasiRepository->find($id);
    }

    /**
     * Simpan Prestasi
     */
    public function create(array $data)
    {
        DB::beginTransaction();

        try {

            $kategoriId = $data['kategori_id'];
            $tingkatanId = $data['tingkatan_id'] ?? null;
            $kategoriDetailId = $data['kategori_detail_id'] ?? null;

            $bobot = $this->bobotRepository->getBobot(
                $kategoriId,
                $tingkatanId,
                $kategoriDetailId
            );

            if (!$bobot) {
                throw new Exception('Bobot SKP tidak ditemukan.');
            }

            $data['bobot'] = $bobot->bobot;

            $data['status'] = 'belum diperiksa';

            $prestasi = $this->prestasiRepository->create($data);

            DB::commit();

            return $prestasi;

        } catch (Exception $e) {

            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Update Prestasi
     */
    public function update(int $id, array $data)
    {
        DB::beginTransaction();

        try {

            $prestasi = $this->prestasiRepository->find($id);

            if (!$prestasi) {
                return null;
            }

        $bobot = $this->bobotRepository->getBobot(
            $data['kategori_id'],
            $data['tingkatan_id'] ?? null,
            $data['kategori_detail_id'] ?? null
        );

        if (!$bobot) {
            throw new Exception('Bobot SKP tidak ditemukan.');
        }

        $data['bobot'] = $bobot->bobot;

            $prestasi = $this->prestasiRepository->update($id, $data);

            DB::commit();

            return $prestasi;

        } catch (Exception $e) {

            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Hapus Prestasi
     */
    public function delete(int $id): bool
    {
        return $this->prestasiRepository->delete($id);
    }

    /**
     * Dashboard Admin
     */
    public function getByStatus(string $status)
    {
        return $this->prestasiRepository->getByStatus($status);
    }

    /**
     * Notifikasi
     */
    public function getNotification(string $nim)
    {
        return $this->prestasiRepository->getNotification($nim);
    }

    /**
     * Predikat SKPI
     */
    private function getPredikat(int $nilai): string
    {
        if ($nilai > 225) {
            return 'Unggul';
        }

        if ($nilai >= 151) {
            return 'Sangat Baik';
        }

        if ($nilai >= 76) {
            return 'Baik';
        }

        if ($nilai >= 25) {
            return 'Cukup';
        }

        return 'Belum Memenuhi';
    }
}