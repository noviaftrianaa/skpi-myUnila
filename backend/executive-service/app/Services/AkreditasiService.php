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
            if ($latest && $latest['tanggal_kadaluarsa']) {
                $expiry_date = \Carbon\Carbon::parse($latest['tanggal_kadaluarsa']);
                $now = \Carbon\Carbon::now();
                $one_year_from_now = \Carbon\Carbon::now()->addYear();
                $is_reakreditasi = $expiry_date->lte($one_year_from_now) && $expiry_date->gte($now);
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
                'history_akreditasi' => $history,
            ];
        })->values();

        // Sort by reakreditasi status first (reakreditasi items first, then aktif)
        $sorted_data = $grouped_data->sortByDesc('is_reakreditasi')->values();

        return $sorted_data;
    }
}
