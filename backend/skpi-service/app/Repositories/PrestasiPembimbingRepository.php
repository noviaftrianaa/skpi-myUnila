<?php

namespace App\Repositories;

use App\Models\PrestasiPembimbing;

class PrestasiPembimbingRepository
{
    public function getByPrestasi(int $prestasiId)
    {
        return PrestasiPembimbing::where('prestasi_id', $prestasiId)->get();
    }

    public function find(int $id): ?PrestasiPembimbing
    {
        return PrestasiPembimbing::find($id);
    }

    public function create(array $data): PrestasiPembimbing
    {
        return PrestasiPembimbing::create($data);
    }

    public function update(int $id, array $data): ?PrestasiPembimbing
    {
        $pembimbing = PrestasiPembimbing::find($id);
        if (!$pembimbing) {
            return null;
        }
        $pembimbing->update($data);
        return $pembimbing->fresh();
    }

    public function delete(int $id): bool
    {
        $pembimbing = PrestasiPembimbing::find($id);
        if (!$pembimbing) {
            return false;
        }
        return (bool) $pembimbing->delete();
    }
}
