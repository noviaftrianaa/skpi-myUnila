<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor3;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Prestasi;
use App\Models\PDUT\Logger\LogLogin;
use App\Models\PDUT\Man_akses\VersiDb;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;


class PrestasiController extends Controller
{
    public function prestasi(Request $request)
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

        $jenis_prestasi = json_encode(Prestasi::prestasi('jenis_prestasi', $tahun_pilih)->first());
        $tingkat_prestasi = json_encode(Prestasi::prestasi('tingkat_prestasi', $tahun_pilih)->first());
        $peringkat = json_encode(Prestasi::prestasi('peringkat', $tahun_pilih)->first());
        $iku_prestasi = json_encode(Prestasi::prestasi('iku_prestasi', $tahun_pilih)->first());

        $query = DB::connection('sqlsrv_live')->select("
            SELECT
                reg.id_reg_pd,
                prodi.id_sms AS y_id_prodi,
                fak.id_sms AS y_id_fakultas,
                CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.nm_lemb AS y_nm_fakultas,
                CASE
                    WHEN prestasi.id_prestasi IS NOT NULL THEN 1
                END AS x_data_yes
            FROM
                pdrd.prestasi AS prestasi WITH(NOLOCK)
                JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                AND smt.expired_date IS NULL
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = prestasi.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                AND prodi.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN ref.jenis_prestasi AS jns_prestasi WITH(NOLOCK) ON jns_prestasi.id_jenis_prestasi = prestasi.id_jenis_prestasi
                ANd jns_prestasi.expired_date IS NULL
                JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                AND tkt_prestasi.expired_date IS NULL
            WHERE
                prestasi.soft_delete = 0
                AND prestasi.thn_prestasi = '". $tahun_pilih ."'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prodi.nm_lemb ASC
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
        $list_mhs_prestasi = json_encode($fakultas);

        $side_active   = 'home.wr.wakil_rektor3.prestasi';
        return view('home.wr.wakil_rektor3.prestasi', compact('tahun', 'tahun_pilih', 'side_active', 'jenis_prestasi', 'tingkat_prestasi', 'peringkat', 'iku_prestasi', 'list_mhs_prestasi'));
    }
}
