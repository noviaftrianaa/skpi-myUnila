<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku3TridharmaQs100;
use DB;
use Illuminate\Database\Seeder;

class Iku3TridharmaQs100Seeder extends Seeder
{
    public function run()
    {
        $this->tridharmaqs100();
    }

    public function tridharmaqs100()
    {
        $sql = "
            SELECT
                detas.id_detasering,
                detas.id_sdm,
                katgiat.nm_kat AS kategori_kegiatan,
                spendsasr.nm_lemb AS perguruan_tinggi_sasaran,
                detas.tgl_mulai AS tanggal_mulai,
                detas.tgl_selesai AS tanggal_selesai,
                detas.bid_tgs AS bidang_tugas,
                detas.desk_keg AS deskripsi_kegiatan,
                detas.metode_laks AS metode_pelaksanaan,
                detas.sk_tugas AS nomor_sk_penugasan,
                detas.tgl_sk_tugas AS tanggal_sk_penugasan
            FROM
                pdrd.detasering AS detas WITH(NOLOCK)
                LEFT JOIN pdrd.satuan_pendidikan AS spendsumb WITH(NOLOCK) ON detas.id_sp_sumber = spendsumb.id_sp
                AND spendsumb.soft_delete = 0
                LEFT JOIN pdrd.satuan_pendidikan AS spendsasr WITH(NOLOCK) ON detas.id_sp_sasaran = spendsasr.id_sp
                AND spendsasr.soft_delete = 0
                LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON detas.id_katgiat = katgiat.id_katgiat
                AND katgiat.expired_date IS NULL
            WHERE
                detas.soft_delete = 0
        ";
        // $data = DB::select($sql);
        $data = DB::connection('sqlsrv_live')->select($sql);
        $no = 1;

        foreach ($data as $each_data) {
            Iku3TridharmaQs100::updateOrInsert([
                'id_detasering' => $each_data->id_detasering,
                'id_sdm' => $each_data->id_sdm
            ], [
                'id_iku3_tridharma_qs100' => guid(),
                'kategori_kegiatan' => $each_data->kategori_kegiatan,
                'perguruan_tinggi_sasaran' => $each_data->perguruan_tinggi_sasaran,
                'tanggal_mulai' => $each_data->tanggal_mulai,
                'tanggal_selesai' => $each_data->tanggal_selesai,
                'bidang_tugas' => $each_data->bidang_tugas,
                'deskripsi_kegiatan' => $each_data->deskripsi_kegiatan,
                'metode_pelaksanaan' => $each_data->metode_pelaksanaan,
                'nomor_sk_penugasan' => $each_data->nomor_sk_penugasan,
                'tanggal_sk_penugasan' => $each_data->tanggal_sk_penugasan,
                'last_sync' => currDateTime()
            ]);
            echo '*) sync tridharma qs100 ke-' . $no++ . ' | ' . $each_data->id_detasering . ' | ' . $each_data->id_sdm . ' | ' . $each_data->kategori_kegiatan . "\n";
            $no++;
        }
    }
}
