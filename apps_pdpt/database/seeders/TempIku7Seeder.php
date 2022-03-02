<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\TempIku7;
use App\Models\PDUT\Dashboard\DetailIku7;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TempIku7Seeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $temp_iku7 = DB::SELECT("SELECT 
            kul.id_mk, 
            kul.nm_mk AS matkul,
			kk.sks_mk AS sks,
            sms.nm_lemb AS prodi,
            sms.kode_prodi,
            fak.nm_lemb AS fakultas,
            sdm.nm_sdm AS nm_dosen,
            ptk.nidn
        FROM 
            pdrd.matkul AS kul WITH(NOLOCK)
        LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kul.id_sms
            AND sms.soft_delete = 0
        LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
            AND fak.soft_delete = 0
        LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_sms = sms.id_sms
            AND kk.soft_delete = 0
        LEFT JOIN pdrd.akt_ajar_dosen AS akt_dosen WITH(NOLOCK) ON akt_dosen.id_kls = kk.id_kls
            AND akt_dosen.soft_delete = 0
        LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_reg_ptk = akt_dosen.id_reg_ptk
            AND ptk.soft_delete = 0
        LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = ptk.id_sdm
        WHERE
            kul.soft_delete = 0
        ORDER BY
            kul.id_mk DESC
        ");

        foreach ($temp_iku7 as $each_data){
                TempIku7::updateOrInsert([
                'id_mk' => $each_data->id_mk,
            ],[
                'prodi' => $each_data->prodi,
                'kode_prodi' => $each_data->kode_prodi,
                'fakultas' => $each_data->fakultas,
                'sks' => $each_data->sks,
                'nm_dosen' => $each_data->nm_dosen,
                'nidn' => $each_data->nidn,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);
            }

        }
    }


        //     $dashboard_iku1 = DB::SELECT("
        //         SELECT
        //             DISTINCT tc.nm_prodi,
        //             sms.id_sms,
        //             tc.id_thn_ajaran,
        //             (
        //                 SELECT
        //                     COUNT(status_lulusan)
        //                 FROM
        //                     temp_iku.tracer_study AS tc_study WITH(NOLOCK)
        //                 WHERE
        //                     tc_study.status_lulusan = 1
        //                     AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
        //                     AND tc_study.nm_prodi = tc.nm_prodi
        //                     AND tc_study.soft_delete = 0
        //             ) AS bekerja,
        //             (
        //                 SELECT
        //                     COUNT(status_lulusan)
        //                 FROM
        //                     temp_iku.tracer_study AS tc_study WITH(NOLOCK)
        //                 WHERE
        //                     tc_study.status_lulusan = 2
        //                     AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
        //                     AND tc_study.nm_prodi = tc.nm_prodi
        //                     AND tc_study.soft_delete = 0
        //             ) AS berwirausaha,
        //             (
        //                 SELECT
        //                     COUNT(status_lulusan)
        //                 FROM
        //                     temp_iku.tracer_study AS tc_study WITH(NOLOCK)
        //                 WHERE
        //                     tc_study.status_lulusan = 3
        //                     AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
        //                     AND tc_study.nm_prodi = tc.nm_prodi
        //                     AND tc_study.soft_delete = 0
        //             ) AS lnjt_studi,
        //             (
        //                 SELECT
        //                     COUNT(status_lulusan)
        //                 FROM
        //                     temp_iku.tracer_study AS tc_study WITH(NOLOCK)
        //                 WHERE
        //                     tc_study.status_lulusan = 0
        //                     AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
        //                     AND tc_study.nm_prodi = tc.nm_prodi
        //                     AND tc_study.soft_delete = 0
        //             ) AS tidak_bekerja,
        //             (
        //                 SELECT
        //                     COUNT(status_lulusan)
        //                 FROM
        //                     temp_iku.tracer_study AS tc_study WITH(NOLOCK)
        //                 WHERE
        //                     tc_study.status_lulusan IN ('1', '2', '3')
        //                     AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
        //                     AND tc_study.nm_prodi = tc.nm_prodi
        //                     AND tc_study.soft_delete = 0
        //             ) AS total_sub,
        //             (
        //                 SELECT
        //                     COUNT(pd.id_pd)
        //                 FROM
        //                     pdrd.peserta_didik AS pd WITH(NOLOCK)
        //                     JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
        //                     AND RIGHT(reg.no_seri_ijazah, 4) = CONVERT(varchar, tc.id_thn_ajaran)
        //                     AND reg.id_sms = sms.id_sms
        //                     AND reg.id_jns_keluar = '1'
        //                     AND reg.soft_delete = 0
        //                 WHERE
        //                     pd.soft_delete = 0
        //             ) AS total_alumni
        //         FROM
        //             temp_iku.tracer_study AS tc
        //             LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc.id_reg_pd
        //             AND reg.soft_delete = 0
        //             LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
        //             AND sms.soft_delete = 0
        //         WHERE
        //             tc.soft_delete = 0
        //         ORDER BY
        //             tc.nm_prodi ASC
        //     ");

        //     foreach ($dashboard_iku1 as $each_data){
        //         $presentase[$each_data->id_sms][$each_data->id_thn_ajaran] = round ($each_data->total_sub / $each_data->total_alumni * 100);
        //     }

        //     foreach ($dashboard_iku1 as $each_data){
        //             DetailIku1::updateOrInsert([
        //                 'id_sms' => $each_data->id_sms,
        //                 'id_tahun_anggaran' => $each_data->id_thn_ajaran,
        //             ],[
        //                 'id_detail_iku_1' => guid(),
        //                 'total_bekerja' => $each_data->bekerja,
        //                 'total_wirausaha' => $each_data->berwirausaha,
        //                 'total_studi' => $each_data->lnjt_studi,
        //                 'total_tidak_bekerja' => $each_data->tidak_bekerja,
        //                 'total_lulusan' => $each_data->total_alumni,
        //                 'total_per_kategori' => $each_data->total_sub,
        //                 'persentase_iku' => $presentase[$each_data->id_sms][$each_data->id_thn_ajaran],
        //                 'create_date' => currDateTime(),
        //                 'last_update' => currDateTime(),
        //                 'expired_date' => currDateTime(),
        //                 'last_sync' => currDateTime()
        //             ]);
        //         }

        //     $per_kategori = DetailIku1::where('id_tahun_anggaran', 2020)->get()->sum('total_per_kategori');
        //     $total_lulusan = DetailIku1::where('id_tahun_anggaran', 2020)->get()->sum('total_lulusan');
        //     $total = round ($per_kategori / $total_lulusan * 100);

        //     echo " Data berhasil diperbaharui\n";
        // }


