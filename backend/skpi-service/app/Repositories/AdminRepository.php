<?php

namespace App\Repositories;

use App\Models\Prestasi;

class AdminRepository
{
    public function getDashboard(): array
    {
        $total = Prestasi::count();
        $belumDiperiksa = Prestasi::where('status', 'belum diperiksa')->count();
        $divalidasi = Prestasi::where('status', 'divalidasi')->count();
        $ditangguhkan = Prestasi::where('status', 'ditangguhkan')->count();
        $ditolak = Prestasi::where('status', 'ditolak')->count();

        return [
            'total_pengajuan' => $total,
            'belum_diperiksa' => $belumDiperiksa,
            'divalidasi' => $divalidasi,
            'ditangguhkan' => $ditangguhkan,
            'ditolak' => $ditolak,
        ];
    }

    public function getPengajuan()
    {
        return Prestasi::with(['kategori', 'tingkatan', 'kategoriDetail'])->latest()->get();
    }

    public function find(int $id): ?Prestasi
    {
        return Prestasi::with(['kategori', 'tingkatan', 'kategoriDetail', 'anggota', 'pembimbing', 'lampiran'])->find($id);
    }

    public function updateStatus(int $id, string $status, ?string $catatan_admin = null): ?Prestasi
    {
        $prestasi = Prestasi::find($id);
        if (!$prestasi) {
            return null;
        }

        $prestasi->update([
            'status' => $status,
            'catatan_admin' => $catatan_admin
        ]);

        return $prestasi->fresh();
    }
}
