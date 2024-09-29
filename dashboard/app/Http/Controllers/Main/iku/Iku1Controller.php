<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku1Export;

class Iku1Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function index()
  {
    $thn_iku = get_tahun_keaktifan();
    return view('content.main.iku.iku-1.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
      $thn_iku = $this->request->thn_iku;
      $id_jns_sms = $this->request->id_jns_sms;
      $id_sms = $this->request->id_sms;

      // IF-ELSE untuk menentukan query berdasarkan kondisi
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
          // Query jika $id_jns_sms == 3 dan $id_sms tidak null
          $select = "
              WITH CTE_MaxPoints AS (
                  SELECT
                      tc.id_hasil_tracer_study,
                      reg.id_reg_pd,
                      prodi.id_sms,
                      CASE
                          -- Kriteria Bekerja
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 0.7
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.5
                          -- Kriteria Wirausaha
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.2
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 1.0
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                          -- Kriteria Melanjutkan Studi
                          WHEN tc.status_lulusan = 3 AND DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365 THEN 1
                          ELSE 0
                      END AS point,
                      ROW_NUMBER() OVER (PARTITION BY reg.id_reg_pd ORDER BY
                          CASE
                              -- Kriteria Bekerja
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 0.7
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.5
                              -- Kriteria Wirausaha
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.2
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 1.0
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                              -- Kriteria Melanjutkan Studi
                              WHEN tc.status_lulusan = 3 AND DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365 THEN 1
                              ELSE 0
                          END DESC) AS rank_order
                  FROM
                      pdrd.reg_pd AS reg
                  LEFT JOIN tracer.hasil_tracer_study AS tc ON tc.id_reg_pd = reg.id_reg_pd
                  AND tc.soft_delete = 0
                  AND tc.status_lulusan IN (1, 2, 3)
                  JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
                  AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                  LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                  AND umr.id_tahun_anggaran = '" . ($thn_iku) . "'
                  AND umr.soft_delete = 0
                  WHERE
                      reg.soft_delete = 0
                      AND reg.id_jns_keluar = '1'
                      AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
                      AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
              )

              SELECT
                  lemb.id_sms,
                  lemb.id_jns_sms,
                  UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                  SUM(iku.point) AS point,
                  COUNT(iku.id_hasil_tracer_study) AS total_responden,
                  COUNT(iku.id_reg_pd) AS total_alumni,
                  CONCAT(
                      CAST(
                          ( NULLIF(SUM(iku.point), 0) * 100 / COUNT(iku.id_hasil_tracer_study)) AS DECIMAL(5, 2)
                      ), '%'
                  ) AS capaian
              FROM
                  pdrd.sms AS lemb
              LEFT JOIN (
                  SELECT
                      prodi.id_sms,
                      tc.id_hasil_tracer_study,
                      tc.id_reg_pd,
                      point
                  FROM CTE_MaxPoints AS tc
                  LEFT JOIN pdrd.sms AS prodi ON prodi.id_sms = tc.id_sms
                  WHERE prodi.soft_delete = 0
                  AND tc.rank_order = 1  -- Ambil hanya poin tertinggi untuk setiap alumni
              ) AS iku ON iku.id_sms = lemb.id_sms
              JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
              AND jenj.expired_date IS NULL
              WHERE
                  lemb.soft_delete = 0
                  AND lemb.id_jns_sms = 3
                  AND lemb.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c', '9b467728-ca97-4922-a9bd-75eb7ec512e1')
                  AND lemb.id_fak_unila = '" . $id_sms . "'
              GROUP BY
                  lemb.id_sms,
                  lemb.nm_lemb,
                  lemb.id_jns_sms,
                  jenj.nm_jenj_didik;
          ";

      } else {
          // Query jika $id_jns_sms != 3 atau $id_sms null
          $select = "
                WITH CTE_MaxPoints AS (
                  SELECT
                      tc.id_hasil_tracer_study,
                      reg.id_reg_pd,
                      fak.id_sms,
                      CASE
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 0.7
                          WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.5
                          -- Kriteria Wirausaha
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.2
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 1.0
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                          WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                          -- Kriteria Melanjutkan Studi
                          WHEN tc.status_lulusan = 3 AND DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365 THEN 1
                          ELSE 0
                      END AS point,
                      ROW_NUMBER() OVER (PARTITION BY reg.id_reg_pd ORDER BY
                          CASE
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 0.7
                              WHEN tc.status_lulusan = 1 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.5
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.2
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln >= (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 1.0
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu <= 6 THEN 1.0
                              WHEN tc.status_lulusan = 2 AND tc.income_per_bln < (1.2 * umr.besaran_umr) AND tc.wkt_tunggu BETWEEN 7 AND 12 THEN 0.8
                              WHEN tc.status_lulusan = 3 AND DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365 THEN 1
                              ELSE 0
                          END DESC) AS rank_order
                  FROM
                      pdrd.reg_pd AS reg
                  LEFT JOIN tracer.hasil_tracer_study AS tc ON tc.id_reg_pd = reg.id_reg_pd
                  AND tc.soft_delete = 0
                  AND tc.status_lulusan IN (1, 2, 3)
                  JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
                  AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                  LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                  AND umr.id_tahun_anggaran = '" . ($thn_iku) . "'
                  AND umr.soft_delete = 0
                  WHERE
                      reg.soft_delete = 0
                      AND reg.id_jns_keluar = '1'
                      AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
                      AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
              )

              SELECT
                  lemb.id_sms,
                  lemb.id_jns_sms,
                  UPPER(lemb.nm_lemb) AS nm_lemb,
                  SUM(iku.point) AS point,
                  COUNT(iku.id_hasil_tracer_study) AS total_responden,
                  COUNT(iku.id_reg_pd) AS total_alumni,
                  CONCAT(
                      CAST(
                          ( NULLIF(SUM(iku.point), 0) * 100 / COUNT(iku.id_hasil_tracer_study)) AS DECIMAL(5, 2)
                      ), '%'
                  ) AS capaian
              FROM
                  pdrd.sms AS lemb
              LEFT JOIN (
                  SELECT
                      fak.id_sms,
                      tc.id_hasil_tracer_study,
                      tc.id_reg_pd,
                      point
                  FROM CTE_MaxPoints AS tc
                  LEFT JOIN pdrd.sms AS fak ON fak.id_sms = tc.id_sms
                  WHERE fak.soft_delete = 0
                  AND tc.rank_order = 1  -- Ambil hanya poin tertinggi untuk setiap alumni
              ) AS iku ON iku.id_sms = lemb.id_sms
              WHERE
                  lemb.soft_delete = 0
                  AND lemb.id_jns_sms = 1
                  AND lemb.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c', '9b467728-ca97-4922-a9bd-75eb7ec512e1')
              GROUP BY
                  lemb.id_sms,
                  lemb.nm_lemb,
                  lemb.id_jns_sms;
          ";
      }

      // Eksekusi query
      $result = DB::select($select);

      // Dapatkan data sinkronisasi terakhir
      $last_sync = collect(
          DB::select('SELECT last_sync AS time FROM tracer.hasil_tracer_study WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      // Inisialisasi variabel
      $iku = array();
      $total_point = 0;
      $total_responden = 0;
      $total_alumni = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'Sistem Tracer Study Universitas Lampung - CCED';

      // Proses hasil query
      foreach ($result as $index => $each_data) {
          $total_point += $each_data->point;
          $total_responden += $each_data->total_responden;
          $total_alumni += $each_data->total_alumni;
          $pembentuk = '( '.$total_point . ' / ' . $total_responden .' ) * 100';

          // Hitung pencapaian
          if ($total_responden != 0) {
              $pencapaian = ($total_point / $total_responden) * 100;
          } else {
              $pencapaian = 0;
          }

          $gold_standart = 60;

          // Hitung delta gold standar
          $sub = $gold_standart - $pencapaian;
          $delta_gold_standart = $pencapaian > $gold_standart ? abs($sub) : $sub;
          $skor_pencapaian = $pencapaian / $gold_standart;

          // Buat array hasil
          $iku['count'] = [
              'total_point' => number_format($total_point, 2),
              'total_responden' => $total_responden,
              'total_alumni' => $total_alumni,
              'pembentuk' => $pembentuk,
              'pencapaian' => number_format($pencapaian, 2) . '%',
              'gold_standart' => number_format($gold_standart, 2) . '%',
              'delta_gold_standart' => number_format($delta_gold_standart, 2) . '%',
              'skor_pencapaian' => number_format($skor_pencapaian, 2) . '%',
              'last_sync' => tglWaktuIndonesia($last_sync->time),
              'rumus' => $rumus,
              'sumber_data' => $sumber_data,
          ];

          // Data per entitas
          $iku['data'][$index] = [
              'id_sms' => $each_data->id_sms,
              'id_jns_sms' => $each_data->id_jns_sms,
              'nm_lemb' => $each_data->nm_lemb,
              'point' => $each_data->point,
              'total_responden' => $each_data->total_responden,
              'total_alumni' => $each_data->total_alumni,
              'capaian' => $each_data->capaian
          ];
      }

      return response()->json($iku);
  }



  public function listRawData()
  {
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;

    // if ($thn_iku == 2023) {
      if (!is_null($id_sms)) {
        $where = "
          WHERE
            prodi.id_sms = '". $id_sms ."'
            AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
          ";
      } else {
        $where = "
          WHERE
            tc.soft_delete = 0
            AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
        ";
      }
      $select = "
          SELECT
              reg.id_reg_pd,
              reg.id_pd,
              YEAR(reg.tgl_keluar) AS tahun_lulus,
              tc.wkt_pengisian,
              reg.nipd,
              pd.nm_pd,
              fak.nm_lemb AS nm_fakultas,
              prodi.nm_lemb AS nm_prodi,
              jenj.nm_jenj_didik,
              reg.tgl_keluar,
              reg.tgl_sk_yudisium,
                  CASE
                  WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                  WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                  WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                  WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                  ELSE 'Belum Mengisi'
              END AS status_lulusan,
              CASE
                  WHEN tc.a_kerja_sblm_lulus = 1 THEN 'Ya'
                  ELSE 'Tidak'
              END AS a_kerja_sblm_lulus,
              CONCAT(tc.wkt_tunggu, ' Bulan') bln_dpt_kerja,
              format(tc.income_per_bln, 'N') AS income_per_bln,
              provinsi.nm_wil,
              tc.nm_tmpt_bekerja,
              CASE
                  WHEN tc.status_lulusan IN (1, 2) THEN FORMAT(1.2 * umr.besaran_umr, 'N')
                  ELSE NULL
              END AS ump,
              CASE
                  WHEN tc.wkt_masuk IS NOT NULL THEN 1
                  ELSE 0
              END AS a_lnjut_study,
              tc.wkt_masuk AS wkt_masuk_lnjt_study,
            CASE
                WHEN tc.status_lulusan = 3 THEN CONCAT(
                    DATEDIFF(MONTH, reg.tgl_keluar, tc.wkt_masuk),
                    ' Bulan'
                )
                ELSE NULL
            END AS jarak_wkt_masuk_lnjt_study,
              tc.nm_pt_lnjt,
              tc.nm_prodi_lnjt,
              tc.ket,
              CASE
                  WHEN tc.status_lulusan = 1 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
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
            tracer.hasil_tracer_study AS tc
      ";
      $join = "
          LEFT JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = tc.id_reg_pd
          AND reg.id_jns_keluar = '1'
          AND reg.soft_delete = 0
          JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
          AND pd.soft_delete = 0
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
          LEFT JOIN ref.wilayah AS provinsi ON provinsi.id_wil = umr.id_wil
          AND provinsi.id_level_wil = 1
          AND provinsi.expired_date IS NULL
      ";
      $order_by = " ORDER BY fak.nm_lemb, prodi.nm_lemb, jenj.nm_jenj_didik, pd.nm_pd ASC ";
      $result = DB::select($select . $join . $where . $order_by);
      foreach ($result as $key => $row) {
        $result[$key]->encrypted_id_pd = \Crypt::encrypt($row->id_pd);
      }

      $detail_iku = array();
      foreach ($result as $index => $each_data) {
        if($each_data->status_lulusan == 'Bekerja' || $each_data->status_lulusan == 'Berwirausaha'){
             $detail_iku['bekber'][] = [
              'id_reg_pd' => $each_data->id_reg_pd,
              'id_pd' => $each_data->id_pd,
              'encrypted_id_pd' => $each_data->encrypted_id_pd,
              'tgl_keluar' => $each_data->tgl_keluar,
              'nipd' => $each_data->nipd,
              'nm_pd' => $each_data->nm_pd,
              'nm_fakultas' => $each_data->nm_fakultas,
              'nm_prodi' => $each_data->nm_prodi,
              'nm_jenj_didik' => $each_data->nm_jenj_didik,
              'status_lulusan' => $each_data->status_lulusan,
              'a_kerja_sblm_lulus' => $each_data->a_kerja_sblm_lulus,
              'bln_dpt_kerja' => $each_data->bln_dpt_kerja,
              'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
              'nm_wil' => $each_data->nm_wil,
              'ump' => $each_data->ump,
              'income_per_bln' => $each_data->income_per_bln,
              'point' => $each_data->point,
             ];
        }
        elseif($each_data->status_lulusan == 'Melanjutkan Studi'){
            $detail_iku['lnjt_studi'][] = [
              'id_reg_pd' => $each_data->id_reg_pd,
              'id_pd' => $each_data->id_pd,
              'encrypted_id_pd' => $each_data->encrypted_id_pd,
              'tgl_keluar' => $each_data->tgl_keluar,
              'nipd' => $each_data->nipd,
              'nm_pd' => $each_data->nm_pd,
              'nm_fakultas' => $each_data->nm_fakultas,
              'nm_prodi' => $each_data->nm_prodi,
              'nm_jenj_didik' => $each_data->nm_jenj_didik,
              'status_lulusan' => $each_data->status_lulusan,
              'nm_wil' => $each_data->nm_wil,
              'wkt_masuk_lnjt_study' => $each_data->wkt_masuk_lnjt_study,
              'jarak_wkt_masuk_lnjt_study' => $each_data->jarak_wkt_masuk_lnjt_study,
              'nm_pt_lnjt' => $each_data->nm_pt_lnjt,
              'nm_prodi_lnjt' => $each_data->nm_prodi_lnjt,
              'point' => $each_data->point,
            ];
        }elseif($each_data->status_lulusan == 'Tidak Bekerja'){
            $detail_iku['tdk_bekber'][] = [
              'id_reg_pd' => $each_data->id_reg_pd,
              'id_pd' => $each_data->id_pd,
              'encrypted_id_pd' => $each_data->encrypted_id_pd,
              'tgl_keluar' => $each_data->tgl_keluar,
              'nipd' => $each_data->nipd,
              'nm_pd' => $each_data->nm_pd,
              'nm_fakultas' => $each_data->nm_fakultas,
              'nm_prodi' => $each_data->nm_prodi,
              'nm_jenj_didik' => $each_data->nm_jenj_didik,
              'status_lulusan' => $each_data->status_lulusan,
              'ket' => $each_data->ket,
              'point' => $each_data->point,
          ];
        }
      }
      return response()->json($detail_iku);


    // } else {
    //   $result = [];
    //   return response()->json($result);
    // }
  }

  public function downloadRawData()
  {
    ini_set('max_execution_time', 0);
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;
    // $id_jns_sms = $this->request->id_jns_sms;

    return Excel::download(new TemplateIku1Export($thn_iku, $id_sms), 'LAPORAN IKU 1 TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');

  }
}
