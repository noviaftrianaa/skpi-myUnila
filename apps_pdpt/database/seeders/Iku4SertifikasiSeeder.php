<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku4Sertifikasi;
use DB;
use Illuminate\Database\Seeder;

class Iku4SertifikasiSeeder extends Seeder
{
    public function run()
    {
        $this->sertifikasi();
    }

    public function sertifikasi()
    {
        $sql = "
            SELECT
                sert.id_rwy_sert,
                sert.id_sdm,
                jsert.nm_jns_sert AS jenis_sertifikasi,
                bids.nm_bid_studi AS bidang_studi,
                sert.sk_sert AS no_sk_sertifikasi,
                sert.thn_sert AS tahun_sertifikasi,
                sert.no_peserta AS nomor_peserta,
                sert.nrg AS nomor_registrasi
            FROM
                pdrd.rwy_sertifikasi AS sert WITH(NOLOCK)
                LEFT JOIN ref.jenis_sert AS jsert WITH(NOLOCK) ON sert.id_jns_sert = jsert.id_jns_sert
                AND jsert.expired_date IS NULL
                LEFT JOIN ref.bidang_studi AS bids WITH(NOLOCK) ON sert.id_bid_studi = bids.id_bid_studi
                AND bids.expired_date IS NULL
            WHERE
                sert.soft_delete = 0
        ";
        // $data = DB::select($sql);
        $data = DB::connection('sqlsrv_live')->select($sql);
        $no = 1;

        foreach ($data as $each_data) {
            Iku4Sertifikasi::updateOrInsert([
                'id_rwy_sert' => $each_data->id_rwy_sert,
                'id_sdm' => $each_data->id_sdm
            ], [
                'id_iku3_sertifikasi' => guid(),
                'jenis_sertifikasi' => $each_data->jenis_sertifikasi,
                'bidang_studi' => $each_data->bidang_studi,
                'no_sk_sertifikasi' => $each_data->no_sk_sertifikasi,
                'tahun_sertifikasi' => $each_data->tahun_sertifikasi,
                'nomor_peserta' => $each_data->nomor_peserta,
                'nomor_registrasi' => $each_data->nomor_registrasi,
                'last_sync' => now()
            ]);
            echo '*) sync sertifikasi ke-' . $no++ . ' | ' . $each_data->id_rwy_sert . ' | ' . $each_data->id_sdm . ' | ' . $each_data->jenis_sertifikasi . "\n";
            $no++;
        }
    }
}
