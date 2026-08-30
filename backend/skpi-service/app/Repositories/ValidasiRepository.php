<?php

namespace App\Repositories;

use App\Models\Prestasi;

class ValidasiRepository
{
    public function getAll(?string $status = null)
    {
        return Prestasi::with([
            'kategori',
            'tingkatan',
            'kategoriDetail'
        ])
        ->when($status, function ($query) use ($status) {
            $query->where('status', $status);
        })
        ->latest()
        ->get();
    }

    public function find(int $id): ?Prestasi
    {
        return Prestasi::with([
            'kategori',
            'tingkatan',
            'kategoriDetail',
            'anggota',
            'pembimbing',
            'lampiran'
        ])->find($id);
    }

    public function updateStatus(
        int $id,
        string $status,
        ?string $catatan = null
    ): ?Prestasi {

        $prestasi = Prestasi::find($id);

        if (!$prestasi) {
            return null;
        }

        $prestasi->update([
            'status' => $status,
            'catatan_admin' => $catatan
        ]);

        return $prestasi->fresh();
    }
}