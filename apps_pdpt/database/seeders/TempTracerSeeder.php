<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\TempTracerStudy;
use App\Models\PDUT\Dashboard\DetailIku1;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TempTracerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {


        $temp_iku1 = DB::SELECT("
            SELECT
                reg.id_reg_pd,
                tc_study.id_thn_ajaran,
                pd.nm_pd AS nm_alumni,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                tc_study.nm_tmpt_bekerja,
                tc_study.level_perusahaan,
                bdg_kerja.nm_bid_kerja,
                tc_study.status_jabatan,
                tc_study.nm_pt_lnjt,
                tc_study.nm_prodi_lnjt,
                prov.nm_wil AS nm_provinsi,
                wilayah.nm_wil AS nm_wilayah,
                reg.tgl_sk_yudisium AS tgl_wisuda,
                tc_study.status_lulusan,
                tc_study.wkt_masuk,
                tc_study.wkt_tunggu,
                tc_study.a_kerja_sblm_lulus,
                tc_study.income_per_bln,
                umr.besaran_umr,
                (
                    SELECT
                        DATEDIFF(MONTH, reg.tgl_sk_yudisium, tc.wkt_masuk)
                    FROM
                        tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                    WHERE
                        tc.id_reg_pd = reg.id_reg_pd
                        AND tc.status_lulusan = 3
                        AND tc.soft_delete = 0
                ) AS wkt_tunggu_lulusan,
                (
                    SELECT
                        tc_bekber.wkt_tunggu
                    FROM
                        tracer.hasil_tracer_study AS tc_bekber WITH(NOLOCK)
                    WHERE
                        tc_bekber.status_lulusan IN ('1', '2')
                        AND tc_bekber.id_reg_pd = reg.id_reg_pd
                        AND tc_bekber.a_kerja_sblm_lulus IS NULL
                        AND tc_bekber.wkt_tunggu <= 6
                        AND tc_bekber.income_per_bln >= 1.2 * umr.besaran_umr
                        AND tc_bekber.soft_delete = 0
                ) AS bek_ber
            FROM
                tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
                LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN ref.bidang_pekerjaan AS bdg_kerja WITH(NOLOCK) ON bdg_kerja.id_bid_kerja = tc_study.id_bid_kerja
                AND bdg_kerja.expired_date IS NULL
                LEFT JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL
                LEFT JOIN ref.wilayah AS prov WITH(NOLOCK) ON prov.id_wil = wilayah.id_induk_wilayah
                AND prov.expired_date IS NULL
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = prov.id_wil
                AND umr.id_tahun_anggaran = tc_study.id_thn_ajaran
                AND umr.soft_delete = 0
            WHERE
                tc_study.soft_delete = 0
            ORDER BY
                tc_study.id_thn_ajaran DESC
        ");

        foreach ($temp_iku1 as $each_data){
            if($each_data->bek_ber !== NULL){
                TempTracerStudy::updateOrInsert([
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
            ],[
                'nm_alumni' => $each_data->nm_alumni,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_prodi' => $each_data->nm_prodi,
                'tgl_wisuda' => $each_data->tgl_wisuda,
                'status_lulusan' => $each_data->status_lulusan,
                'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
                'level_perusahaan' => $each_data->level_perusahaan,
                'nm_bid_kerja' => $each_data->nm_bid_kerja,
                'wkt_tunggu' => $each_data->wkt_tunggu,
                'a_kerja_sblm_lulus' => $each_data->a_kerja_sblm_lulus,
                'income_per_bln' => $each_data->income_per_bln,
                'status_jabatan' => $each_data->status_jabatan,
                'nm_pt_lnjt' => $each_data->nm_pt_lnjt,
                'nm_prodi_lnjt' => $each_data->nm_prodi_lnjt,
                'wkt_masuk' => $each_data->wkt_masuk,
                'nm_wil' => $each_data->nm_wilayah,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);
            }

            if($each_data->status_lulusan == 3 && $each_data->wkt_tunggu_lulusan <= 12){
                TempTracerStudy::updateOrInsert([
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
            ],[
                'nm_alumni' => $each_data->nm_alumni,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_prodi' => $each_data->nm_prodi,
                'tgl_wisuda' => $each_data->tgl_wisuda,
                'status_lulusan' => $each_data->status_lulusan,
                'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
                'level_perusahaan' => $each_data->level_perusahaan,
                'nm_bid_kerja' => $each_data->nm_bid_kerja,
                'wkt_tunggu' => $each_data->wkt_tunggu,
                'a_kerja_sblm_lulus' => $each_data->a_kerja_sblm_lulus,
                'income_per_bln' => $each_data->income_per_bln,
                'status_jabatan' => $each_data->status_jabatan,
                'nm_pt_lnjt' => $each_data->nm_pt_lnjt,
                'nm_prodi_lnjt' => $each_data->nm_prodi_lnjt,
                'wkt_masuk' => $each_data->wkt_masuk,
                'nm_wil' => $each_data->nm_wilayah,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);
            }

            if($each_data->status_lulusan == 0 ){
                TempTracerStudy::updateOrInsert([
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
            ],[
                'nm_alumni' => $each_data->nm_alumni,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_prodi' => $each_data->nm_prodi,
                'tgl_wisuda' => $each_data->tgl_wisuda,
                'status_lulusan' => $each_data->status_lulusan,
                'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
                'level_perusahaan' => $each_data->level_perusahaan,
                'nm_bid_kerja' => $each_data->nm_bid_kerja,
                'wkt_tunggu' => $each_data->wkt_tunggu,
                'a_kerja_sblm_lulus' => $each_data->a_kerja_sblm_lulus,
                'income_per_bln' => $each_data->income_per_bln,
                'status_jabatan' => $each_data->status_jabatan,
                'nm_pt_lnjt' => $each_data->nm_pt_lnjt,
                'nm_prodi_lnjt' => $each_data->nm_prodi_lnjt,
                'wkt_masuk' => $each_data->wkt_masuk,
                'nm_wil' => $each_data->nm_wilayah,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);             
            }  
        }

            $dashboard_iku1 = DB::SELECT("
                SELECT
                    DISTINCT tc.nm_prodi,
                    sms.id_sms,
                    tc.id_thn_ajaran,
                    (
                        SELECT
                            COUNT(status_lulusan)
                        FROM
                            temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                        WHERE
                            tc_study.status_lulusan = 1
                            AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                            AND tc_study.nm_prodi = tc.nm_prodi
                            AND tc_study.soft_delete = 0
                    ) AS bekerja,
                    (
                        SELECT
                            COUNT(status_lulusan)
                        FROM
                            temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                        WHERE
                            tc_study.status_lulusan = 2
                            AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                            AND tc_study.nm_prodi = tc.nm_prodi
                            AND tc_study.soft_delete = 0
                    ) AS berwirausaha,
                    (
                        SELECT
                            COUNT(status_lulusan)
                        FROM
                            temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                        WHERE
                            tc_study.status_lulusan = 3
                            AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                            AND tc_study.nm_prodi = tc.nm_prodi
                            AND tc_study.soft_delete = 0
                    ) AS lnjt_studi,
                    (
                        SELECT
                            COUNT(status_lulusan)
                        FROM
                            temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                        WHERE
                            tc_study.status_lulusan = 0
                            AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                            AND tc_study.nm_prodi = tc.nm_prodi
                            AND tc_study.soft_delete = 0
                    ) AS tidak_bekerja,
                    (
                        SELECT
                            COUNT(status_lulusan)
                        FROM
                            temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                        WHERE
                            tc_study.status_lulusan IN ('1', '2', '3')
                            AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                            AND tc_study.nm_prodi = tc.nm_prodi
                            AND tc_study.soft_delete = 0
                    ) AS total_sub,
                    (
                        SELECT
                            COUNT(pd.id_pd)
                        FROM
                            pdrd.peserta_didik AS pd WITH(NOLOCK)
                            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                            AND RIGHT(reg.no_seri_ijazah, 4) = CONVERT(varchar, tc.id_thn_ajaran)
                            AND reg.id_sms = sms.id_sms
                            AND reg.id_jns_keluar = '1'
                            AND reg.soft_delete = 0
                        WHERE
                            pd.soft_delete = 0
                    ) AS total_alumni
                FROM
                    temp_iku.tracer_study AS tc
                    LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc.id_reg_pd
                    AND reg.soft_delete = 0
                    LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                WHERE
                    tc.soft_delete = 0
                ORDER BY
                    tc.nm_prodi ASC
            ");

            foreach ($dashboard_iku1 as $each_data){
                $presentase[$each_data->id_sms][$each_data->id_thn_ajaran] = round ($each_data->total_sub / $each_data->total_alumni * 100);
            }

            foreach ($dashboard_iku1 as $each_data){
                    DetailIku1::updateOrInsert([
                        'id_sms' => $each_data->id_sms,
                        'id_tahun_anggaran' => $each_data->id_thn_ajaran,
                    ],[
                        'id_detail_iku_1' => guid(),
                        'total_bekerja' => $each_data->bekerja,
                        'total_wirausaha' => $each_data->berwirausaha,
                        'total_studi' => $each_data->lnjt_studi,
                        'total_tidak_bekerja' => $each_data->tidak_bekerja,
                        'total_lulusan' => $each_data->total_alumni,
                        'total_per_kategori' => $each_data->total_sub,
                        'persentase_iku' => $presentase[$each_data->id_sms][$each_data->id_thn_ajaran],
                        'create_date' => currDateTime(),
                        'last_update' => currDateTime(),
                        'expired_date' => currDateTime(),
                        'last_sync' => currDateTime()
                    ]);
                }

            $per_kategori = DetailIku1::where('id_tahun_anggaran', 2020)->get()->sum('total_per_kategori');
            $total_lulusan = DetailIku1::where('id_tahun_anggaran', 2020)->get()->sum('total_lulusan');
            $total = round ($per_kategori / $total_lulusan * 100);

            echo " Data berhasil diperbaharui\n";
        }

}
