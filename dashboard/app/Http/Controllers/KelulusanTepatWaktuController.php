<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Session;
use Alert;
use DataTables;

class KelulusanTepatWaktuController extends Controller
{
  public function index(Request $request)
  {
    $pageConfigs = ['myLayout' => 'horizontal'];
    $title = 'Kelulusan Tepat Waktu';

    return view('content.pages.ktw.index', [
      'pageConfigs' => $pageConfigs,
      'title' => $title,
      'tahun' => get_tahun_keaktifan(),
    ]);
  }

  public function data(Request $request)
  {
    $tahun = $request->tahun ?? get_tahun_keaktifan();
    $sms = $request->id_sms ? " AND sms.id_sms='" . $request->id_sms . "' " : ' ';

    $data = DB::SELECT(
      "
            SELECT
                reg.id_reg_pd,
                pd.nm_pd,
                reg.tgl_sk_yudisium,
                reg.id_jns_keluar,
                sms.id_sms,
                sms.nm_lemb AS prodi,
                jenjang.nm_jenj_didik AS jenjang,
                sms.sks_lulus,
                kuliah.sks AS sks_total,
                kuliah.ip_mk,
                kuliah.ipk,
                substring(reg.id_semester_masuk, 1, 4) AS semester_masuk,
                year(reg.tgl_sk_yudisium) AS semester_keluar,
                (year(reg.tgl_sk_yudisium) - substring(reg.id_semester_masuk, 1, 4)) AS thn_kuliah
            FROM
                pdrd.peserta_didik AS pd
                join pdrd.reg_pd AS reg on reg.id_pd = pd.id_pd
                and reg.soft_delete = 0
                join (
                    SELECT
                        distinct mhs.id_reg_pd,
                        mhs.id_sms,
                        sum(mhs.ip_mk) AS ip_mk,
                        sum(mhs.sks_mk) AS sks,
                        (sum(mhs.ip_mk) / sum(mhs.sks_mk)) AS ipk
                    FROM
                        (
                            SELECT
                                DISTINCT nilai.id_reg_pd,
                                kelas.id_sms,
                                kelas.id_mk,
                                kelas.sks_mk,
                                (kelas.sks_mk*max(nilai.nilai_indeks)) AS ip_mk
                            FROM
                                pdrd.kelas_kuliah as kelas
                                join pdrd.nilai_smt_mhs as nilai on nilai.id_kls = kelas.id_kls
                                and nilai.soft_delete = 0
                            WHERE
                                kelas.soft_delete = 0
                            GROUP BY
                                nilai.id_reg_pd,
                                kelas.id_sms,
                                kelas.id_mk,
                                kelas.sks_mk
                    ) AS mhs
                group BY
                    mhs.id_reg_pd,
                    mhs.id_sms
                ) as kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
                join pdrd.sms As sms on sms.id_sms = kuliah.id_sms
                and sms.soft_delete = 0
                join ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik and jenjang.expired_date IS NULL
            WHERE
                pd.soft_delete = 0
                " .
        $sms .
        "
            order BY
                kuliah.sks desc
        "
    );

    // AND reg.tgl_sk_yudisium IS NOT NULL
    // AND reg.id_jns_keluar='1'
    // and substring(kelas.id_smt, 1, 4) <= '" .
    // $tahun .
    // "'

    if ($request->table == true) {
      return DataTables::of($data)
        ->addIndexColumn()
        ->make(true);
    }

    $temp = [];
    $temp['ktw_tepat'] = collect($data)
      ->whereNotNull('tgl_sk_yudisium')
      ->whereIn('id_jns_keluar', ['1'])
      ->where('thn_kuliah', '<=', 4)
      ->whereBetween('semester_keluar', [$tahun - 4, $tahun]);
    $temp['ktw_tidak_tepat'] = collect($data)
      ->whereNotNull('tgl_sk_yudisium')
      ->whereIn('id_jns_keluar', ['1'])
      ->where('thn_kuliah', '>', 4)
      ->whereBetween('semester_keluar', [$tahun - 4, $tahun]);
    $temp['ktw_tidak_lulus'] = collect($data)
      ->whereNull('tgl_sk_yudisium')
      ->whereNotIn('id_jns_keluar', ['1'])
      ->whereBetween('semester_masuk', [$tahun - 4, $tahun]);

    return $temp;
  }
}
