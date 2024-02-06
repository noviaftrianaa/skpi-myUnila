<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class Iku1Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function index()
  {
    return view('content.main.iku.iku-1.index');
  }

  public function listTotalPoint()
  {
    $thn_iku = $this->request->thn_iku;
    $id_jns_sms = $this->request->id_jns_sms;
    $id_sms = $this->request->id_sms;

    if ($thn_iku = 2023) {
      if ($id_jns_sms = 3 && !is_null($id_sms)) {
        $select = "
          SELECT
            lemb.id_sms,
            lemb.id_jns_sms,
            UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
            SUM(iku.point) AS point,
            COUNT(iku.id_hasil_tracer_study) AS total_responden,
            COUNT(iku.id_reg_pd) AS total_alumni,
            FORMAT((NULLIF(SUM(iku.point), 0) / COUNT(iku.id_hasil_tracer_study)), 'P') AS capaian
            FROM pdrd.sms AS lemb
        ";
        $join =
          "
          JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
          AND jenj.expired_date IS NULL
          LEFT JOIN (
              SELECT
                  prodi.id_sms,
                  tc.id_hasil_tracer_study,
                  reg.id_reg_pd,
                  CASE
                  WHEN tc.status_lulusan = 1 AND ( tc.wkt_tunggu = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                    OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1
                  WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8
                  WHEN tc.status_lulusan = 1 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                    OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 0.7
                  WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.5

                  WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                    OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) )THEN 1.2
                  WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 1.0
                  WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                    OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1.0
                  WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8

                  WHEN tc.status_lulusan = 3 AND ( DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365) THEN 1
              ELSE 0
            END AS point
              FROM
                  pdrd.reg_pd AS reg
                  LEFT JOIN tracer.hasil_tracer_study AS tc ON tc.id_reg_pd = reg.id_reg_pd
                  AND tc.soft_delete = 0
                  JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
                  AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                  LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                  AND umr.id_tahun_anggaran = YEAR(reg.tgl_keluar) + 1
                  AND umr.soft_delete = 0
              WHERE
                  reg.soft_delete = 0
                  AND reg.id_jns_keluar = '1'
                  AND YEAR(reg.tgl_keluar) = '" .
          ($thn_iku - 1) .
          "'
          ) AS iku ON iku.id_sms = lemb.id_sms
      WHERE
          lemb.soft_delete = 0
        ";
        $where =
          "
        AND lemb.id_jns_sms = 3
        AND lemb.stat_prodi = 'A'
        AND lemb.id_jenj_didik IN (20, 21, 22, 23, 30)
        AND lemb.id_fak_unila = '" .
          $id_sms .
          "'
        ";
        $group_by = "
          GROUP BY
          lemb.id_sms,
          lemb.nm_lemb,
          lemb.id_jns_sms,
          jenj.nm_jenj_didik
        ";
      } else {
        $select = "
          SELECT
            lemb.id_sms,
            lemb.id_jns_sms,
            UPPER(lemb.nm_lemb) AS nm_lemb,
            SUM(iku.point) AS point,
            COUNT(iku.id_hasil_tracer_study) AS total_responden,
            COUNT(iku.id_reg_pd) AS total_alumni,
            FORMAT((NULLIF(SUM(iku.point), 0) / COUNT(iku.id_hasil_tracer_study)), 'P') AS capaian
            FROM pdrd.sms AS lemb
        ";
        $join =
          "
          LEFT JOIN (
              SELECT
                  fak.id_sms,
                  tc.id_hasil_tracer_study,
                  reg.id_reg_pd,
                  CASE
                  WHEN tc.status_lulusan = 1 AND ( tc.wkt_tunggu = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                    OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1
                  WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8
                  WHEN tc.status_lulusan = 1 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                    OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 0.7
                  WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.5

                  WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                    OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) )THEN 1.2
                  WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 1.0
                  WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                    OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1.0
                  WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8

                  WHEN tc.status_lulusan = 3 AND ( DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365) THEN 1
              ELSE 0
            END AS point
              FROM
                  pdrd.reg_pd AS reg
                  LEFT JOIN tracer.hasil_tracer_study AS tc ON tc.id_reg_pd = reg.id_reg_pd
                  AND tc.soft_delete = 0
                  JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
                  AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                  LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                  AND umr.id_tahun_anggaran = YEAR(reg.tgl_keluar) + 1
                  AND umr.soft_delete = 0
              WHERE
                  reg.soft_delete = 0
                  AND reg.id_jns_keluar = '1'
                  AND YEAR(reg.tgl_keluar) = '" .
          ($thn_iku - 1) .
          "'
          ) AS iku ON iku.id_sms = lemb.id_sms
      WHERE
          lemb.soft_delete = 0
        ";
        $where = "
          AND lemb.id_jns_sms = 1
          AND lemb.id_sms NOT IN (
            '61752f1d-2cd6-4186-a2da-8189e2c3bc0c',
            '9b467728-ca97-4922-a9bd-75eb7ec512e1'
            )
          ";
        $group_by = "
          GROUP BY
          lemb.id_sms,
          lemb.nm_lemb,
          lemb.id_jns_sms
      ";
      }
      $result = DB::select($select . $join . $where . $group_by);
      $last_sync = collect(
        DB::select('SELECT last_sync FROM tracer.hasil_tracer_study WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = [];
      $total_point = 0;
      $total_responden = 0;
      $total_alumni = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'Sistem Tracer Study Universitas Lampung - CCED';

      foreach ($result as $index => $each_data) {
        $total_point += $each_data->point;
        $total_responden += $each_data->total_responden;
        $total_alumni += $each_data->total_alumni;
        $pembentuk = $total_point . '/' . $total_responden;
        if ($total_responden != 0) {
          $pencapaian = ($total_point / $total_responden) * 100;
        } else {
          $pencapaian = 0;
        }
        $gold_standart = 60;
        $delta_gold_standart = $gold_standart - $pencapaian;
        $skor_pencapaian = $pencapaian / $gold_standart;

        $iku['count'] = [
          'total_point' => number_format($total_point, 2),
          'total_responden' => $total_responden,
          'total_alumni' => $total_alumni,
          'pembentuk' => $pembentuk,
          'pencapaian' => number_format($pencapaian, 2) . '%',
          'gold_standart' => number_format($gold_standart, 2) . '%',
          'delta_gold_standart' => number_format($delta_gold_standart, 2) . '%',
          'skor_pencapaian' => number_format($skor_pencapaian, 2) . '%',
          'last_sync' => tglWaktuIndonesia(currDateTime($last_sync)),
          'rumus' => $rumus,
          'sumber_data' => $sumber_data,
        ];
        $iku['data'][$index] = [
          'id_sms' => $each_data->id_sms,
          'id_jns_sms' => $each_data->id_jns_sms,
          'nm_lemb' => $each_data->nm_lemb,
          'point' => $each_data->point,
          'total_responden' => $each_data->total_responden,
          'total_alumni' => $each_data->total_alumni,
          'capaian' => $each_data->capaian,
        ];
      }

      return response()->json($iku);
    } else {
      $result = 'IKU tidak tersedia';
      return response()->json($result);
    }
  }

  public function listRawData()
  {
  }

  public function downloadRawData()
  {
  }
}
