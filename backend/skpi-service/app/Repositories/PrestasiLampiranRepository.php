<?php

namespace App\Repositories;

use App\Models\PrestasiLampiran;

class PrestasiLampiranRepository
{
    /**
     * Simpan lampiran
     */
    public function create(array $data): PrestasiLampiran
    {
        return PrestasiLampiran::create($data);
    }

    /**
     * Semua lampiran berdasarkan prestasi
     */
    public function getByPrestasi(int $prestasiId)
    {
        return PrestasiLampiran::where('prestasi_id', $prestasiId)
            ->orderBy('id')
            ->get();
    }

    /**
     * Detail lampiran
     */
    public function find(int $id): ?PrestasiLampiran
    {
        return PrestasiLampiran::find($id);
    }

    /**
     * Hapus lampiran
     */
    public function delete(int $id): bool
    {
        $lampiran = PrestasiLampiran::find($id);

        if (!$lampiran) {
            return false;
        }

        return (bool) $lampiran->delete();
    }
}