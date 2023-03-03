<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor4;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Logger\LogLogin;
use App\Models\PDUT\Man_akses\VersiDb;
use App\Models\PDUT\Tracer\HasilTracerStudy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;

class TracerStudyController extends Controller
{
    public function alumni(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $tahun = [];
        $maks_tahun = '';
        for ($thn = (date('Y') - 5); $thn <= get_tahun_keaktifan(); $thn++) {
            $tahun[$thn] = (int) $thn;
            $maks_tahun = $thn;
        }
        if ($request->has('tahun')) {
            $tahun_pilih = $request->tahun;
        } else {
            $tahun_pilih = 2021;
        }

        $alumni_jk = json_encode(HasilTracerStudy::tracer_study('alumni_jk', $tahun_pilih)->first());
        $alumni_pendidikan = json_encode(HasilTracerStudy::tracer_study('alumni_pendidikan', $tahun_pilih)->first());
        $status_lulusan = json_encode(HasilTracerStudy::tracer_study('status_lulusan', $tahun_pilih)->first());
        $tingkat_perusahaan = json_encode(HasilTracerStudy::tracer_study('tingkat_perusahaan', $tahun_pilih)->first());
        $bidang_kerja = json_encode(HasilTracerStudy::tracer_study('bidang_kerja', $tahun_pilih)->first());

        $query = DB::connection('sqlsrv_live')->select("
            SELECT
                rgpd.id_reg_pd,
                prod.id_sms AS y_id_prodi,
                fak.id_sms AS y_id_fakultas,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.nm_lemb AS y_nm_fakultas,
                CASE
                    WHEN tc.id_hasil_tracer_study IS NOT NULL THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                pdrd.reg_pd AS rgpd WITH(NOLOCK)
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                LEFT JOIN tracer.hasil_tracer_study AS tc WITH(NOLOCK) ON tc.id_reg_pd = rgpd.id_reg_pd
                AND tc.soft_delete = 0
            WHERE
                rgpd.soft_delete = 0
                AND YEAR(rgpd.tgl_keluar) = 2021
                AND rgpd.id_jns_keluar = '1'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prod.nm_lemb ASC
        ");

        $fakultas = [];
        foreach ($query as $v) {
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $v->x_data_yes
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $v->x_data_yes;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($query as $v) {
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $v->x_data_yes,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $v->x_data_yes;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        $respon_rate = json_encode($fakultas);


        $side_active   = 'home.wr.wakil_rektor4.tracer_study';
        return view('home.wr.wakil_rektor4.tracer_study', compact('tahun', 'tahun_pilih', 'side_active', 'alumni_jk', 'alumni_pendidikan', 'status_lulusan', 'tingkat_perusahaan', 'bidang_kerja', 'respon_rate'));
    }
}
