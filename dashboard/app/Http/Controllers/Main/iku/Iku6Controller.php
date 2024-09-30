<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2Export;

class Iku6Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function index()
  {
    $thn_iku = get_tahun_keaktifan();
    return view('content.main.iku.iku-6.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
      $thn_iku = 2023; //thn iku mengikuti raw data pada iku PT
      $id_jns_sms = $this->request->id_jns_sms;
      $id_sms = $this->request->id_sms;

      // Initialize a filter condition for the year based on $thn_iku
      $yearFilter = "AND (
          YEAR(mou.tgl_mulai) = " . $thn_iku . "
          OR (mou.tgl_selesai IS NULL OR YEAR(mou.tgl_selesai) >= " . $thn_iku . ")
      )";

      // Check if the type is correct
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
          $where = "AND lemb.id_fak_unila = '" . $id_sms . "'";

          $select = "
              WITH CTE_Bobot AS (
                  SELECT
                      prodi_mou.id_sms,
                      verif.bobot,
                      mou.id_akt_kerjasama,
                      ROW_NUMBER() OVER (
                          PARTITION BY prodi_mou.id_sms, mou.id_akt_kerjasama
                          ORDER BY verif.bobot DESC
                      ) AS row_num
                  FROM
                      kerjasama.sms_kerjasama AS prodi_mou
                      LEFT JOIN kerjasama.mou AS mou WITH(NOLOCK)
                      ON mou.id_mou = prodi_mou.id_mou AND mou.soft_delete = 0
                      JOIN temp_iku.verifikasi_kerjasama_iku_6 AS verif WITH(NOLOCK)
                      ON verif.id_sms_kerjasama = prodi_mou.id_sms_kerjasama AND verif.expired_date IS NULL
                  WHERE
                      prodi_mou.soft_delete = 0
                      $yearFilter
              ),
              Derived_Bobot_Aggregated AS (
                  SELECT
                      id_sms,
                      SUM(bobot) AS total_bobot,
                      COUNT(DISTINCT CASE WHEN bobot > 0 THEN id_akt_kerjasama END) AS valid -- Only count non-zero bobot
                  FROM
                      CTE_Bobot
                  WHERE
                      row_num = 1
                  GROUP BY
                      id_sms
              ),
              CTE_Kerja_Sama AS (
                  SELECT
                      id_sms,
                      COUNT(DISTINCT id_sms_kerjasama) AS total
                  FROM
                      kerjasama.sms_kerjasama
                  WHERE
                      soft_delete = 0
                  GROUP BY
                      id_sms
              )
              SELECT
                  lemb.id_sms,
                  lemb.id_jns_sms,
                  CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_lemb,
                  COALESCE(kerja_sama.total, 0) AS total_kerja_sama,
                  COALESCE(derived_bobot.valid, 0) AS total_valid,
                  COALESCE(derived_bobot.total_bobot, 0) AS total_bobot,
                  COUNT(lemb.id_sms) AS total_prodi,
                  CONCAT(
                      CAST(
                          (
                              (COALESCE(derived_bobot.total_bobot, 0) / COUNT(lemb.id_sms) OVER ())
                          ) AS DECIMAL(5, 2)
                      ),
                      '%'
                  ) AS capaian
              FROM
                  pdrd.sms AS lemb WITH(NOLOCK)
                  JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = lemb.id_fak_unila AND fak.soft_delete = 0
                  JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK)
                  ON jenj.id_jenj_didik = lemb.id_jenj_didik AND jenj.expired_date IS NULL
                  AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                  LEFT JOIN Derived_Bobot_Aggregated AS derived_bobot ON derived_bobot.id_sms = lemb.id_sms
                  LEFT JOIN CTE_Kerja_Sama AS kerja_sama ON kerja_sama.id_sms = lemb.id_sms
              WHERE
                  lemb.id_jns_sms = 3 AND lemb.soft_delete = 0 AND lemb.stat_prodi = 'A'
                  $where
              GROUP BY
                  lemb.id_sms, lemb.id_jns_sms, lemb.nm_lemb, jenj.nm_jenj_didik, kerja_sama.total,
                  derived_bobot.valid, derived_bobot.total_bobot
              ORDER BY total_bobot DESC
          ";

      } else {
          $select = "
            WITH CTE_Bobot AS (
                SELECT
                    prodi_mou.id_sms,
                    verif.bobot,
                    mou.id_akt_kerjasama,
                    ROW_NUMBER() OVER (
                        PARTITION BY prodi_mou.id_sms, mou.id_akt_kerjasama
                        ORDER BY verif.bobot DESC
                    ) AS row_num
                FROM
                    kerjasama.sms_kerjasama AS prodi_mou
                    LEFT JOIN kerjasama.mou AS mou WITH(NOLOCK)
                    ON mou.id_mou = prodi_mou.id_mou
                    AND mou.soft_delete = 0
                    JOIN temp_iku.verifikasi_kerjasama_iku_6 AS verif WITH(NOLOCK)
                    ON verif.id_sms_kerjasama = prodi_mou.id_sms_kerjasama
                    AND verif.expired_date IS NULL
                WHERE
                    prodi_mou.soft_delete = 0
                    $yearFilter
            ),
            Derived_Bobot_Aggregated AS (
                SELECT
                    id_sms,
                    SUM(bobot) AS total_bobot,
                    COUNT(
                        DISTINCT CASE
                            WHEN bobot > 0 THEN id_akt_kerjasama
                        END
                    ) AS valid
                FROM
                    CTE_Bobot
                WHERE
                    row_num = 1
                GROUP BY
                    id_sms
            ),
            Derived_Faculty_Aggregated AS (
                SELECT
                    prodi.id_fak_unila AS id_fakultas,
                    SUM(derived_bobot.total_bobot) AS total_bobot,
                    SUM(derived_bobot.valid) AS total_valid
                FROM
                    pdrd.sms AS prodi WITH(NOLOCK)
                    JOIN Derived_Bobot_Aggregated AS derived_bobot
                    ON derived_bobot.id_sms = prodi.id_sms
                WHERE
                    prodi.soft_delete = 0
                GROUP BY
                    prodi.id_fak_unila
            ),
            CTE_Kerja_Sama AS (
                SELECT
                    prodi.id_fak_unila AS id_fakultas,
                    COUNT(DISTINCT kerjasama.id_sms_kerjasama) AS total
                FROM
                    kerjasama.sms_kerjasama AS kerjasama
                    JOIN pdrd.sms AS prodi WITH(NOLOCK)
                    ON prodi.id_sms = kerjasama.id_sms
                    AND prodi.soft_delete = 0
                    AND prodi.stat_prodi = 'A'
                    AND prodi.id_jns_sms = 3
                GROUP BY
                    prodi.id_fak_unila
            ),
            CTE_Total_Prodi AS (
                SELECT
                    id_fak_unila AS id_fakultas,
                    COUNT(id_sms) AS total_prodi
                FROM
                    pdrd.sms
                WHERE
                    soft_delete = 0
                    AND stat_prodi = 'A'
                    AND id_jns_sms = 3
                    AND id_jenj_didik IN (20, 21, 22, 23, 30)
                GROUP BY
                    id_fak_unila
            )
            SELECT
                fak.id_sms AS id_fakultas,
                fak.id_jns_sms,
                fak.nm_lemb AS nm_fakultas,
                COALESCE(kerja_sama.total, 0) AS total_kerja_sama,
                COALESCE(faculty_agg.total_valid, 0) AS total_valid,
                COALESCE(faculty_agg.total_bobot, 0) AS total_bobot,
                prodi_count.total_prodi AS total_prodi,
                CONCAT(
                    CAST(
                        (
                            COALESCE(faculty_agg.total_bobot, 0) / prodi_count.total_prodi
                        ) AS DECIMAL(5, 2)
                    ),
                    '%'
                ) AS capaian
            FROM
                pdrd.sms AS fak WITH(NOLOCK)
                LEFT JOIN Derived_Faculty_Aggregated AS faculty_agg
                ON faculty_agg.id_fakultas = fak.id_sms
                LEFT JOIN CTE_Kerja_Sama AS kerja_sama
                ON kerja_sama.id_fakultas = fak.id_sms
                LEFT JOIN CTE_Total_Prodi AS prodi_count
                ON prodi_count.id_fakultas = fak.id_sms
            WHERE
                fak.id_jns_sms = 1
                AND fak.soft_delete = 0
                AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c', '9b467728-ca97-4922-a9bd-75eb7ec512e1')
            GROUP BY
                fak.id_sms,
                fak.id_jns_sms,
                fak.nm_lemb,
                kerja_sama.total,
                prodi_count.total_prodi,
                faculty_agg.total_valid,
                faculty_agg.total_bobot
            ORDER BY
                total_bobot DESC;
          ";
      }

      // Execute the query
      $result = DB::select($select);
      $last_sync = collect(
          DB::select('SELECT last_sync AS time FROM kerjasama.sms_kerjasama WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      // Prepare response data
      $iku = array();
      $total_point = 0;
      $total_prodi = 0;
      $total_valid = 0; // Initialize total_valid
      $total_kerja_sama = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'SIKERMA UNILA (Coming Soon) - IKU PT Kemdikbud (Data Kerjasama 2023)';

      // Iterate over result set
      foreach ($result as $index => $each_data) {
          $total_point += $each_data->total_bobot;
          $total_prodi += $each_data->total_prodi;
          $total_kerja_sama += $each_data->total_kerja_sama;
          $total_valid += $each_data->total_valid; // Update total_valid
          $pembentuk = $total_point . '/' . $total_prodi;

          // Calculate pencapaian
          $pencapaian = $total_prodi != 0 ? ($total_point / $total_prodi) : 0;
          $gold_standart = 0.6;
          $sub = $gold_standart - $pencapaian;

          $delta_gold_standart = $pencapaian > $gold_standart ? abs($sub) : $sub;
          $skor_pencapaian = $pencapaian / $gold_standart;

          // Store data in $iku array
          $iku['count'] = [
              'total_point' => number_format($total_point, 2),
              'total_prodi' => $total_prodi,
              'total_valid' => $total_valid, // Store total_valid
              'total_kerja_sama' => $total_kerja_sama,
              'pembentuk' => $pembentuk,
              'pencapaian' => number_format($pencapaian, 2),
              'gold_standart' => number_format($gold_standart, 2),
              'delta_gold_standart' => number_format($delta_gold_standart, 2),
              'skor_pencapaian' => number_format($skor_pencapaian, 2),
              'last_sync' => tglWaktuIndonesia($last_sync->time),
              'rumus' => $rumus,
              'sumber_data' => $sumber_data
          ];

          $iku['data'][$index] = [
              'id_sms' => $each_data->id_sms ?? $each_data->id_fakultas,
              'id_jns_sms' => $each_data->id_jns_sms ?? $each_data->id_jns_sms,
              'nm_lemb' => $each_data->nm_lemb ?? $each_data->nm_fakultas,
              'total_point' => $each_data->total_bobot,
              'total_prodi' => $each_data->total_prodi,
              'total_valid' => $each_data->total_valid, // Include total_valid
              'total_kerja_sama' => $each_data->total_kerja_sama,
              'capaian' => $each_data->capaian,
          ];
      }

      return response()->json($iku);
  }

  public function listRawData()
  {
      $thn_iku = 2023;
      $id_sms = $this->request->id_sms;

      // SQL Query Template
      $where = ""; // Default value for WHERE condition
      if (!is_null($id_sms)) {
          $where .= " AND prodi.id_sms = '" . $id_sms . "' ";
      }

      // SQL Query
      $select = "
        SELECT
            prodi_mou.id_sms,
            UPPER(fak.nm_lemb) AS nm_fak,
            UPPER(CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_prodi,
            jenj.nm_jenj_didik AS nm_jenj_didik,
            mou.nm_dudi,
            kriteria.nm_kriteria_mitra,
            akt.nm_akt_kerjasama,
            mou.tgl_mulai,
            mou.tgl_selesai,
            bntk.nm_bntk_giat_kerjasama,
            mou.judul_mou,
            verif.verifikasi,
            verif.bobot
        FROM
            kerjasama.sms_kerjasama AS prodi_mou WITH(NOLOCK)
            JOIN kerjasama.mou AS mou WITH(NOLOCK) ON mou.id_mou = prodi_mou.id_mou
            AND mou.soft_delete = 0
            LEFT JOIN ref.aktifitas_kerjasama AS akt WITH(NOLOCK) ON akt.id_akt_kerjasama = mou.id_akt_kerjasama
            AND akt.expired_date IS NULL
            LEFT JOIN ref.kriteria_mitra AS kriteria WITH(NOLOCK) ON kriteria.id_kriteria_mitra = prodi_mou.id_kriteria_mitra
            AND kriteria.expired_date IS NULL
            LEFT JOIN ref.bentuk_kegiatan_kerjasama AS bntk ON bntk.id_bntk_giat_kerjasama = prodi_mou.id_bntk_giat_kerjasama
            AND bntk.expired_date IS NULL
            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = prodi_mou.id_sms
            AND prodi.id_jns_sms = 3
            AND prodi.soft_delete = 0
            AND prodi.stat_prodi = 'A'
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
            AND jenj.expired_date IS NULL
            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
            AND fak.soft_delete = 0
            JOIN temp_iku.verifikasi_kerjasama_iku_6 AS verif ON verif.id_sms_kerjasama = prodi_mou.id_sms_kerjasama
            AND verif.expired_date IS NULL
        WHERE
            prodi_mou.soft_delete = 0
            $where
    ";

      $result = DB::select($select);

      foreach ($result as $key => $row) {
          $result[$key]->encrypted_id_sms = \Crypt::encrypt($row->id_sms);
      }

      return response()->json($result);
  }

  public function downloadRawData()
  {
    ini_set('max_execution_time', 0);
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;
    // $id_jns_sms = $this->request->id_jns_sms;

    return Excel::download(new TemplateIku2Export($thn_iku, $id_sms), 'LAPORAN IKU 2 TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');

  }
}
