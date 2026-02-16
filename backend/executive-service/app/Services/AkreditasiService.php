<?php

namespace App\Services;

use App\Repositories\AkreditasiRepository;

class AkreditasiService
{
    protected AkreditasiRepository $akreditasiRepository;

    public function __construct(AkreditasiRepository $akreditasi)
    {
        $this->akreditasiRepository = $akreditasi;
    }

    public function getDataAkreditasiFakultas()
    {
        $data_fakultas = $this->akreditasiRepository->getDataAkreditasiFakultas();
        return $data_fakultas;
    }

    public function getDataAkreditasiProdi($idProdi)
    {
        $raw_data = $this->akreditasiRepository->getDataAkreditasiProdi($idProdi);

        // Group data by prodi ID and add history
        $grouped_data = collect($raw_data)->groupBy('id')->map(function ($items) {
            $first = $items->first();

            // Build history array sorted by date (newest first)
            $history = $items->sortByDesc('tanggal_sk_akreditasi_prodi')->map(function ($item) {
                return [
                    'sk_akreditasi' => $item->sk_akreditasi_prodi,
                    'tanggal_sk' => $item->tanggal_sk_akreditasi_prodi,
                    'tanggal_kadaluarsa' => $item->tst_sk_akreditasi_prodi,
                    'nilai_akreditasi' => $item->nilai_akreditasi,
                    'lembaga_akreditasi' => $item->lembaga_akreditasi,
                ];
            })->values()->toArray();

            // Calculate accreditation status
            $latest = $history[0] ?? null;
            $status_akreditasi = $latest ? $latest['nilai_akreditasi'] : 'Proses';

            // Check if will expire within 1 year
            $is_reakreditasi = false;
            $is_kadaluarsa = false;
            if ($latest && $latest['tanggal_kadaluarsa']) {
                $expiry_date = \Carbon\Carbon::parse($latest['tanggal_kadaluarsa']);
                $now = \Carbon\Carbon::now();
                $one_year_from_now = \Carbon\Carbon::now()->addYear();

                // Check if expired
                $is_kadaluarsa = $expiry_date->lt($now);

                // Check if will expire within 1 year (but not expired)
                $is_reakreditasi = !$is_kadaluarsa && $expiry_date->lte($one_year_from_now) && $expiry_date->gte($now);
            }

            return [
                'id' => $first->id,
                'id_fakultas' => $first->id_fak,
                'id_jurusan' => $first->id_jur,
                'nama_prodi' => $first->nama_prodi,
                'jenjang' => $first->jenjang_didik,
                'akreditasi_terakhir' => $latest ? $latest['nilai_akreditasi'] : 'Proses',
                'tahun_akreditasi' => $latest ? \Carbon\Carbon::parse($latest['tanggal_sk'])->year : null,
                'status_akreditasi' => $status_akreditasi,
                'tanggal_kadaluarsa' => $latest ? $latest['tanggal_kadaluarsa'] : null,
                'lembaga_akreditasi' => $latest ? $latest['lembaga_akreditasi'] : null,
                'is_reakreditasi' => $is_reakreditasi,
                'is_kadaluarsa' => $is_kadaluarsa,
                'history_akreditasi' => $history,
            ];
        })->values();

        // Sort by kadaluarsa status first (kadaluarsa items first, then reakreditasi, then aktif)
        $sorted_data = $grouped_data->sortByDesc(function ($item) {
            // Priority: kadaluarsa (2) > reakreditasi (1) > aktif (0)
            if ($item['is_kadaluarsa']) return 2;
            if ($item['is_reakreditasi']) return 1;
            return 0;
        })->values();

        return $sorted_data;
    }
}
