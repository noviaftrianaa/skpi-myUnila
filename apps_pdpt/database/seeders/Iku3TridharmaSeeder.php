<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku3Tridharma;
use DB;
use Illuminate\Database\Seeder;

class Iku3TridharmaSeeder extends Seeder
{
    public function run()
    {
        $this->tridharma();
    }

    public function tridharma()
    {
        $sql = "
            SELECT
                als.id_litabmas,
                als.id_sdm,
                ls.id_thn_laks AS tahun_anggaran,
                CASE
                    ls.jns_litabmas
                    WHEN 'M' THEN 'Pengabdian'
                    WHEN 'L' THEN 'Penelitian'
                END AS jenis_kegiatan,
                katgiat.nm_kat AS kategori_kegiatan,
                CASE
                    ls.stat_aktif
                    WHEN 1 THEN 'Aktif'
                    WHEN 0 THEN 'Tidak Aktif'
                END AS keaktifan_kegiatan,
                skim.nm_skim AS skim_kegiatan,
                ipt.nm_lemb AS afiliasi,
                kb.nm_kel_bidang AS kelompok_bidang,
                ls.sk_tugas AS nomor_sk_penugasan,
                ls.tgl_sk_tugas AS tanggal_sk_penugasan,
                ls.lama_kegiatan,
                ls.judul_litabmas AS judul_kegiatan,
                ls.lokasi_kegiatan,
                ls.thn_laks_ke AS tahun_pelaksanaan_ke,
                CASE
                    als.stat_aktif
                    WHEN 1 THEN 'Aktif'
                    WHEN 0 THEN 'Tidak Aktif'
                END AS keaktifan_kegiatan_dosen,
                CASE
                    als.peran_litabmas
                    WHEN 'A' THEN 'Anggota'
                    WHEN 'K' THEN 'Ketua'
                    WHEN NULL THEN 'Pengajaran'
                END AS peran_kegiatan_dosen
            FROM
                pdrd.sdm_anggota_litabmas AS als WITH(NOLOCK)
                LEFT JOIN pdrd.litabmas AS ls WITH(NOLOCK) ON als.id_litabmas = ls.id_litabmas
                AND ls.soft_delete = 0
                LEFT JOIN pdrd.lembaga_iptek AS ipt WITH(NOLOCK) ON ls.id_lemb_iptek = ipt.id_lemb_iptek
                AND ipt.soft_delete = 0
                LEFT JOIN ref.skim_kegiatan AS skim ON ls.id_skim = skim.id_skim
                AND skim.expired_date IS NULL
                LEFT JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = ls.id_kel_bidang
                AND kb.expired_date IS NULL
                LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON als.id_katgiat = katgiat.id_katgiat
                AND katgiat.expired_date IS NULL
            WHERE
                als.soft_delete = 0
                AND als.stat_aktif = 1
                AND ls.id_thn_laks IN(2021, 2020, 2019, 2018, 2017)
                AND ls.id_lemb_iptek != 'e2b705a7-173e-464a-9fac-509128709515'
                AND ls.stat_aktif = 1
        ";
        // $data = DB::select($sql);
        $data = DB::connection('sqlsrv_live')->select($sql);
        $no = 1;

        foreach ($data as $each_data) {
            Iku3Tridharma::updateOrInsert([
                'id_litabmas' => $each_data->id_litabmas,
                'id_sdm' => $each_data->id_sdm
            ], [
                'id_iku3_tridharma' => guid(),
                'tahun_anggaran' => $each_data->tahun_anggaran,
                'jenis_kegiatan' => $each_data->jenis_kegiatan,
                'kategori_kegiatan' => $each_data->kategori_kegiatan,
                'keaktifan_kegiatan' => $each_data->keaktifan_kegiatan,
                'skim_kegiatan' => $each_data->skim_kegiatan,
                'afiliasi' => $each_data->afiliasi,
                'kelompok_bidang' => $each_data->kelompok_bidang,
                'nomor_sk_penugasan' => $each_data->nomor_sk_penugasan,
                'tanggal_sk_penugasan' => $each_data->tanggal_sk_penugasan,
                'lama_kegiatan' => $each_data->lama_kegiatan,
                'judul_kegiatan' => $each_data->judul_kegiatan,
                'lokasi_kegiatan' => $each_data->lokasi_kegiatan,
                'tahun_pelaksanaan_ke' => $each_data->tahun_pelaksanaan_ke,
                'peran_kegiatan_dosen' => $each_data->peran_kegiatan_dosen,
                'keaktifan_kegiatan_dosen' => $each_data->keaktifan_kegiatan_dosen,
                'last_sync' => currDateTime()
            ]);
            echo '*) sync tridharma ke-' . $no++ . ' | ' . $each_data->id_litabmas . ' | ' . $each_data->id_sdm . ' | ' . $each_data->kategori_kegiatan . "\n";
            $no++;
        }
    }
}
