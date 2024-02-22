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
    $sms = \App\Models\Pdrd\SMS::where('soft_delete', 0)
      ->where('id_jns_sms', 1)
      ->whereNotIn('nm_lemb', ['FKIP'])
      ->orderBy('nm_lemb')
      ->get();

    return view('content.pages.ktw.index', [
      'pageConfigs' => $pageConfigs,
      'title' => $title,
      'tahun' => get_tahun_keaktifan(),
      'sms' => $sms,
    ]);
  }

  public function data(Request $request)
  {
    $tahun = $request->tahun ?? get_tahun_keaktifan();
    $sms = $request->id_sms == 'all' ? ' ' : " AND fak.id_sms='" . $request->id_sms . "' ";

    $data = collect(
      DB::SELECT(
        "
        SELECT
            reg.id_reg_pd,
            pd.nm_pd,
            reg.tgl_keluar,
            reg.id_jns_keluar,
            sms.id_sms,
            sms.nm_lemb AS prodi,
            jenjang.nm_jenj_didik AS jenjang,
            sms.sks_lulus,
            (
                SELECT
                    TOP 1 mhs.total_sks
                FROM
                    pdrd.kuliah_mhs AS mhs
                WHERE
                    mhs.soft_delete = 0
                    AND mhs.id_reg_pd = reg.id_reg_pd
                ORDER BY
                    mhs.id_smt DESC
            ) AS sks_total,
            (
                SELECT
                    TOP 1 mhs.ipk
                FROM
                    pdrd.kuliah_mhs AS mhs
                WHERE
                    mhs.soft_delete = 0
                    AND mhs.id_reg_pd = reg.id_reg_pd
                ORDER BY
                    mhs.id_smt DESC
            ) AS ipk,
            reg.tgl_masuk_sp AS tgl_masuk,
            (
                SELECT
                    max(kelas.id_smt)
                FROM
                    pdrd.nilai_smt_mhs as nilai
                    JOIN pdrd.kelas_kuliah AS kelas ON kelas.id_kls = nilai.id_kls
                    AND kelas.soft_delete = 0
                WHERE
                    nilai.id_reg_pd = reg.id_reg_pd
                    AND nilai.soft_delete = 0
            ) AS semester_akhir,
            DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) AS thn_kuliah,
            year(reg.tgl_keluar) AS tgl_lulus,
            CASE
                WHEN sms.id_jenj_didik = 20 THEN 1
                WHEN sms.id_jenj_didik = 21 THEN 2
                WHEN sms.id_jenj_didik = 22 THEN 3
                WHEN sms.id_jenj_didik = 23 THEN 4
                WHEN sms.id_jenj_didik = 30 THEN 4
                WHEN sms.id_jenj_didik = 31 THEN 2
                WHEN sms.id_jenj_didik = 32 THEN 2
                WHEN sms.id_jenj_didik = 35 THEN 2
                WHEN sms.id_jenj_didik = 36 THEN 2
                WHEN sms.id_jenj_didik = 37 THEN 2
                WHEN sms.id_jenj_didik = 40 THEN 3
                WHEN sms.id_jenj_didik = 41 THEN 3
                ELSE 0
            END AS syarat_tahun_lulus,
            CASE
                WHEN sms.id_jenj_didik = 20 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 1 THEN 1
                WHEN sms.id_jenj_didik = 21 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 22 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 3 THEN 1
                WHEN sms.id_jenj_didik = 23 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 4 THEN 1
                WHEN sms.id_jenj_didik = 30 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 4 THEN 1
                WHEN sms.id_jenj_didik = 31 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 32 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 35 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 36 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 37 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 2 THEN 1
                WHEN sms.id_jenj_didik = 40 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 3 THEN 1
                WHEN sms.id_jenj_didik = 41 AND DATEDIFF(YEAR, reg.tgl_masuk_sp, reg.tgl_keluar) <= 3 THEN 1
                ELSE 0
            END AS status
        FROM
            pdrd.peserta_didik AS pd
            join pdrd.reg_pd AS reg on reg.id_pd = pd.id_pd
            and reg.soft_delete = 0
            join pdrd.sms As sms on sms.id_sms = reg.id_sms
            and sms.soft_delete = 0
            join pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila
            AND fak.soft_delete = 0
            join ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
            and jenjang.expired_date IS NULL
        WHERE
            pd.soft_delete = 0
            ANd reg.id_jns_keluar = '1'
            AND reg.tgl_masuk_sp IS NOT NULL
            AND reg.tgl_keluar IS NOT NULL
            AND reg.no_seri_ijazah IS NOT NULL
            " .
          $sms .
          "
        order BY
            semester_akhir desc
    "
      )
    );
    // CONVERT(DECIMAL(10,2), ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2)) AS thn_kuliah,
    // year(reg.tgl_keluar) - substring(reg.id_semester_masuk, 1, 4)

    $data = $data->whereBetween('semester_akhir', [$tahun - 4 . '1', $tahun . '2']);

    if ($request->table == true) {
      return DataTables::of($data)
        ->addIndexColumn()
        ->make(true);
    }

    $temp['data'] = $data;

    $temp = [];
    $getSmt = [];
    for ($i = $tahun; $i >= $tahun - 4; $i--) {
      $getSmt[] = $i . '2';
      $getSmt[] = $i . '1';
    }
    $temp['smt'] = $getSmt;

    $ktw_tepat = $data->where('status', 1)->pluck('semester_akhir');
    $ktw_tepat = array_count_values($ktw_tepat->toArray());
    $list = [];

    foreach ($getSmt as $item) {
      $list[$item] = 0;
      foreach ($ktw_tepat as $smt => $value) {
        if ($smt == $item) {
          $list[$item] += $value;
        }
      }
    }
    $temp['studi']['ktw_tepat'] = array_values($list);

    $ktw_tidak_tepat = $data->where('status', 0)->pluck('semester_akhir');
    $ktw_tidak_tepat = array_count_values($ktw_tidak_tepat->toArray());
    $list = [];

    foreach ($getSmt as $item) {
      $list[$item] = 0;
      foreach ($ktw_tidak_tepat as $smt => $value) {
        if ($smt == $item) {
          $list[$item] += $value;
        }
      }
    }
    $temp['studi']['ktw_tidak_tepat'] = array_values($list);

    $ktw_tepat = $data
      ->where('status', 1)
      ->whereBetween('ipk', [3, 4])
      ->pluck('semester_akhir');
    $ktw_tepat = array_count_values($ktw_tepat->toArray());
    $list = [];

    foreach ($getSmt as $item) {
      $list[$item] = 0;
      foreach ($ktw_tepat as $smt => $value) {
        if ($smt == $item) {
          $list[$item] += $value;
        }
      }
    }
    $temp['ipk']['ktw_tepat'] = array_values($list);

    $ktw_tidak_tepat = $data
      ->where('status', 0)
      ->whereBetween('ipk', [3, 4])
      ->pluck('semester_akhir');
    $ktw_tidak_tepat = array_count_values($ktw_tidak_tepat->toArray());
    $list = [];

    foreach ($getSmt as $item) {
      $list[$item] = 0;
      foreach ($ktw_tidak_tepat as $smt => $value) {
        if ($smt == $item) {
          $list[$item] += $value;
        }
      }
    }
    $temp['ipk']['ktw_tidak_tepat'] = array_values($list);

    return $temp;
  }
}
