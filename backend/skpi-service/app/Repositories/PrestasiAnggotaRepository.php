<?php

namespace App\Repositories;

use App\Models\PrestasiAnggota;

class PrestasiAnggotaRepository
{
    public function getByPrestasi(int $prestasiId)
    {
        return PrestasiAnggota::where('prestasi_id', $prestasiId)->get();
    }

    public function find(int $id): ?PrestasiAnggota
    {
        return PrestasiAnggota::find($id);
    }

    public function create(array $data): PrestasiAnggota
    {
        return PrestasiAnggota::create($data);
    }

    public function update(int $id, array $data): ?PrestasiAnggota
    {
        $anggota = PrestasiAnggota::find($id);
        if (!$anggota) {
            return null;
        }
        $anggota->update($data);
        return $anggota->fresh();
    }

    public function delete(int $id): bool
    {
        $anggota = PrestasiAnggota::find($id);
        if (!$anggota) {
            return false;
        }
        return (bool) $anggota->delete();
    }
}
