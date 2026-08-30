<?php

namespace App\Repositories;

use App\Models\Prestasi;

class PrestasiRepository extends BaseRepository
{
    /**
     * Dashboard & Data SKPI Mahasiswa
     */
    public function getByNim(string $nim)
    {
        return Prestasi::with([
            'kategori',
            'tingkatan',
            'kategoriDetail',
            'lampiran',
            'anggota',
            'pembimbing'
        ])
        ->where('nim', $nim)
        ->orderByDesc('created_at')
        ->get();
    }

    /**
     * Detail Prestasi
     */
    public function find(int $id): ?Prestasi
    {
        return Prestasi::with([
            'kategori',
            'tingkatan',
            'kategoriDetail',
            'lampiran',
            'anggota',
            'pembimbing'
        ])->find($id);
    }

    /**
     * Simpan Prestasi
     */
    public function create(array $data): Prestasi
    {
        return Prestasi::create($data);
    }

    /**
     * Update Prestasi
     */
    public function update(int $id, array $data): ?Prestasi
    {
        $prestasi = Prestasi::find($id);

        if (!$prestasi) {
            return null;
        }

        $prestasi->update($data);

        return $prestasi->fresh();
    }

    /**
     * Hapus Prestasi
     */
    public function delete(int $id): bool
    {
        $prestasi = Prestasi::find($id);

        if (!$prestasi) {
            return false;
        }

        return (bool) $prestasi->delete();
    }

    /**
     * Total Bobot SKP
     */
    public function getTotalBobot(string $nim): int
    {
        return (int) Prestasi::where('nim', $nim)
            ->where('status', 'divalidasi')
            ->sum('bobot');
    }

    /**
     * Dashboard Admin
     */
    public function getByStatus(string $status)
    {
        return Prestasi::with([
            'kategori',
            'tingkatan',
            'kategoriDetail'
        ])
        ->where('status', $status)
        ->orderBy('created_at')
        ->get();
    }

    /**
     * Dashboard Admin
     */
    public function countByStatus(string $status): int
    {
        return Prestasi::where('status', $status)
            ->count();
    }

    /**
     * Dashboard Mahasiswa
     */
    public function countByNim(string $nim): int
    {
        return Prestasi::where('nim', $nim)->count();
    }

    /**
     * Notifikasi
     */
    public function getNotification(string $nim)
    {
        return Prestasi::select(
                'id',
                'judul_kegiatan',
                'status',
                'catatan_admin',
                'updated_at'
            )
            ->where('nim', $nim)
            ->whereNotNull('catatan_admin')
            ->orderByDesc('updated_at')
            ->get();
    }
}