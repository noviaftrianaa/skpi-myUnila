<?php

namespace App\Repositories;

use App\Models\Prestasi;
use Illuminate\Support\Facades\DB;

class DashboardRepository
{
    public function getDashboard(string $nim): array
    {
        $totalKegiatan = Prestasi::where('nim', $nim)->count();

        $totalPoin = Prestasi::where('nim', $nim)
            ->where('status', 'divalidasi')
            ->sum('bobot');

        $divalidasi = Prestasi::where('nim', $nim)
            ->where('status', 'divalidasi')
            ->count();

        $menunggu = Prestasi::where('nim', $nim)
            ->where('status', 'belum diperiksa')
            ->count();

        return [
            'total_kegiatan' => $totalKegiatan,
            'total_poin' => $totalPoin,
            'divalidasi' => $divalidasi,
            'menunggu_validasi' => $menunggu
        ];
    }

    public function getPrestasiPerTahun(string $nim)
    {
        return Prestasi::select(
                'tahun',
                DB::raw('COUNT(*) as total')
            )
            ->where('nim', $nim)
            ->groupBy('tahun')
            ->orderBy('tahun')
            ->get();
    }

    public function getJenisPrestasi(string $nim)
    {
        return Prestasi::join(
                'tingkatan',
                'prestasi.tingkatan_id',
                '=',
                'tingkatan.id'
            )
            ->select(
                'tingkatan.nama',
                DB::raw('COUNT(*) as total')
            )
            ->where('nim', $nim)
            ->groupBy('tingkatan.nama')
            ->get();
    }

    public function getDistribusiKategori(string $nim)
    {
        return Prestasi::join(
                'kategori_kegiatan',
                'prestasi.kategori_id',
                '=',
                'kategori_kegiatan.id'
            )
            ->select(
                'kategori_kegiatan.nama',
                DB::raw('COUNT(*) as total')
            )
            ->where('nim', $nim)
            ->groupBy('kategori_kegiatan.nama')
            ->get();
    }

    public function getAktivitasTerbaru(string $nim)
    {
        return Prestasi::with([
                'kategori',
                'tingkatan'
            ])
            ->where('nim', $nim)
            ->latest()
            ->limit(5)
            ->get();
    }
}