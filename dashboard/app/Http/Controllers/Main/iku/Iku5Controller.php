<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2Export;

class Iku5Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function index()
  {
    $thn_iku = get_tahun_keaktifan();
    return view('content.main.iku.iku-5.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
      $thn_iku = $this->request->thn_iku;
      $id_jns_sms = $this->request->id_jns_sms;
      $id_sms = $this->request->id_sms;

    //   if ($thn_iku == 2023) {
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
            $where = "AND prodi.id_fak_unila = '" . $id_sms . "'";
        } else {
            $where = "";
        }

      $select = "WITH PublikasiDosen AS (
          SELECT
              sdm.id_sdm,
              " . ($id_jns_sms == 3 && !is_null($id_sms) ? "prodi.id_sms" : "fak.id_sms") . " AS id_sms,
              " . ($id_jns_sms == 3 && !is_null($id_sms) ? "prodi.id_jns_sms" : "fak.id_jns_sms") . " AS id_jns_sms,
              UPPER(" . ($id_jns_sms == 3 && !is_null($id_sms) ? "CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')')" : "fak.nm_lemb") . ") AS nm_lemb,
              publikasi.id_publikasi,
              bobot.bobot,
              ROW_NUMBER() OVER (PARTITION BY sdm.id_sdm, tulis_pub.id_katgiat ORDER BY bobot.bobot DESC) AS row_num
          FROM
              pdrd.sdm AS sdm WITH (NOLOCK)
              JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK)
                  ON ptk.id_sdm = sdm.id_sdm
                  AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                  AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
              JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH (NOLOCK)
                  ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                  AND aktf_ptk.soft_delete = 0
                  AND aktf_ptk.a_sp_homebase = 1
                  AND aktf_ptk.id_thn_ajaran = ".$thn_iku."
              LEFT JOIN pdrd.sms AS prodi WITH (NOLOCK)
                  ON prodi.id_sms = ptk.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  AND prodi.id_jns_sms = 3
              JOIN pdrd.sms AS fak WITH (NOLOCK)
                  ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
              JOIN ref.jenjang_pendidikan AS jenj WITH (NOLOCK)
                  ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
              LEFT JOIN pdrd.satuan_pendidikan AS sp WITH (NOLOCK)
                  ON sp.id_sp = ptk.id_sp
                  AND sp.soft_delete = 0
                  AND sp.stat_sp = 'A'
                  AND LEFT(sp.id_wil, 2) <> '99'
                  AND sp.npsn = '001026'
              JOIN pdrd.tulis_pub AS tulis_pub WITH (NOLOCK)
                  ON tulis_pub.id_sdm = sdm.id_sdm
                  AND tulis_pub.soft_delete = 0
                  AND tulis_pub.id_katgiat IN (
                      '120101', '120102', '120103', '120104', '120105', '120106', '120107',
                      '120108', '120109', '120110', '120111', '120112', '120113', '120114',
                      '120115', '120117', '120118', '120119', '120120', '120121', '120122',
                      '120200', '120300', '120403', '120404', '120903', '120905', '120907',
                      '120909', '121300', '150100', '150201', '120400', '120500', '120700',
                      '120800', '121000', '121101', '121201', '120116', '120801', '120804',
                      '120807', '120810', '120901', '120902', '120701', '120704', '120705',
                      '120706', '120707', '120708', '120501', '120502', '120503', '120504',
                      '120401', '120402', '120405', '120406', '120407'
                  )
              JOIN pdrd.publikasi AS publikasi WITH (NOLOCK)
                  ON publikasi.id_publikasi = tulis_pub.id_publikasi
                  AND publikasi.soft_delete = 0
                  AND (publikasi.tgl_terbit >= '" . $thn_iku . "-01-01' AND publikasi.tgl_terbit <= '" . $thn_iku . "-12-31')
              LEFT JOIN temp_iku.bobot_iku_5 AS bobot WITH (NOLOCK)
                  ON bobot.id_katgiat = tulis_pub.id_katgiat
                  AND bobot.expired_date IS NULL
                  AND bobot.thn_ajaran = ".$thn_iku."
          WHERE
              sdm.id_jns_sdm = 12
              AND sdm.soft_delete = 0
              AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
              $where
      ),
      TotalDosen AS (
          SELECT
              " . ($id_jns_sms == 3 && !is_null($id_sms) ? "prodi.id_sms" : "fak.id_sms") . " AS id_sms,
              " . ($id_jns_sms == 3 && !is_null($id_sms) ? "prodi.id_jns_sms" : "fak.id_jns_sms") . " AS id_jns_sms,
              UPPER(" . ($id_jns_sms == 3 && !is_null($id_sms) ? "CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')')" : "fak.nm_lemb") . ") AS nm_lemb,
              COUNT(DISTINCT sdm.id_sdm) AS total_dosen
          FROM
              pdrd.sdm AS sdm WITH (NOLOCK)
              JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK)
                  ON ptk.id_sdm = sdm.id_sdm
                  AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                  AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
              JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH (NOLOCK)
                  ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                  AND aktf_ptk.soft_delete = 0
                  AND aktf_ptk.a_sp_homebase = 1
                  AND aktf_ptk.id_thn_ajaran = ".$thn_iku."
              LEFT JOIN pdrd.sms AS prodi WITH (NOLOCK)
                  ON prodi.id_sms = ptk.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  AND prodi.id_jns_sms = 3
              JOIN pdrd.sms AS fak WITH (NOLOCK)
                  ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
              JOIN ref.jenjang_pendidikan AS jenj WITH (NOLOCK)
                  ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
          WHERE
              sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
              $where
          GROUP BY " . ($id_jns_sms == 3 && !is_null($id_sms) ? "prodi.id_sms, prodi.id_jns_sms, prodi.nm_lemb, jenj.nm_jenj_didik" : "fak.id_sms, fak.id_jns_sms, fak.nm_lemb") . "
      )
      SELECT
          COALESCE(pub.id_sms, dos.id_sms) AS id_sms,
          COALESCE(pub.id_jns_sms, dos.id_jns_sms) AS id_jns_sms,
          UPPER(COALESCE(pub.nm_lemb, dos.nm_lemb)) AS nm_lemb,
          dos.total_dosen,
          COALESCE(pub.total_dosen_pub, 0) AS total_dosen_pub,
          COALESCE(pub.total_publikasi, 0) AS total_publikasi,
          COALESCE(pub.total_bobot, 0) AS total_bobot,
          COALESCE(ROUND((pub.total_bobot / dos.total_dosen) * 10, 1), 0) AS capaian
      FROM
          TotalDosen AS dos
          LEFT JOIN (
              SELECT
                  id_sms,
                  id_jns_sms,
                  nm_lemb,
                  COUNT(DISTINCT id_sdm) AS total_dosen_pub,
                  COUNT(id_publikasi) AS total_publikasi,
                  SUM(bobot) AS total_bobot
              FROM
                  PublikasiDosen
              WHERE
                  row_num = 1
              GROUP BY
                  id_sms, id_jns_sms, nm_lemb
          ) AS pub ON pub.id_sms = dos.id_sms
      GROUP BY
          pub.id_sms, pub.id_jns_sms, pub.nm_lemb, dos.id_sms, dos.id_jns_sms, dos.nm_lemb, dos.total_dosen, pub.total_dosen_pub, pub.total_publikasi, pub.total_bobot
      ORDER BY
          pub.total_bobot DESC";

      $result = DB::select($select);

      $last_sync = collect(
        DB::select('SELECT last_sync AS time FROM pdrd.publikasi WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = array();
      $total_point = 0;
      $total_dosen = 0;
      $total_publikasi = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'SISTER UNILA - SISTER PDDIKTI';

      foreach ($result as $index => $each_data) {
        $total_point += $each_data->total_bobot;
        $total_dosen += $each_data->total_dosen;
        $total_publikasi += $each_data->total_publikasi;
        $pembentuk = $total_point . '/' . $total_dosen;
        if ($total_dosen != 0) {
            $pencapaian = round(($total_point / $total_dosen) * 10, 1);
        } else {
          $pencapaian = 0;
        }
        $gold_standart = 0.5;

        $sub = $gold_standart - $pencapaian;
        if($pencapaian > $gold_standart){
          $delta_gold_standart = abs($sub);
        }else{
          $delta_gold_standart = $sub;
        }
        $skor_pencapaian = $pencapaian / $gold_standart;

        $iku['count'] = [
            'total_point' => number_format($total_point, 2),
            'total_publikasi' => $total_publikasi,
            'total_dosen' => $total_dosen,
            'pembentuk' => $pembentuk,
            'pencapaian' => number_format($pencapaian, 2, ',', '') . ' %',
            'gold_standart' => number_format($gold_standart, 2) . '%',
            'delta_gold_standart' => number_format($delta_gold_standart, 2) . '%',
            'skor_pencapaian' => number_format($skor_pencapaian, 2) . '%',
            'last_sync' => tglWaktuIndonesia($last_sync->time),
            'rumus' => $rumus,
            'sumber_data' => $sumber_data,
        ];
        $iku['data'][$index] = [
            'id_sms' => $each_data->id_sms,
            'id_jns_sms' => $each_data->id_jns_sms,
            'nm_lemb' => $each_data->nm_lemb,
            'total_point' => $each_data->total_bobot,
            'total_publikasi' => $each_data->total_publikasi,
            'total_dosen' => $each_data->total_dosen,
            // 'capaian' => number_format((float)$each_data->capaian, 2) . '%'
            'capaian' => number_format((float)$each_data->capaian, 2, ',', '') . ' %'
        ];
      }

      return response()->json($iku);
    // } else {
    //     $result = [];
    //     return response()->json($result);
    // }
  }

  public function listRawData()
  {
      $thn_iku = $this->request->thn_iku;
      $id_sms = $this->request->id_sms;

      // SQL Query Template
      $where = ""; // Default value for WHERE condition
      if ($thn_iku == $thn_iku) {
          if (!is_null($id_sms)) {
              $where .= " AND prodi.id_sms = '" . $id_sms . "' ";
          }
      }

      // SQL Query
      $select = "
      WITH AktifDosen AS (
          SELECT
              sdm.id_sdm,
              sdm.nm_sdm,
              sdm.nidn,
              prodi.id_sms AS id_prodi,
              fak.id_sms AS id_fak,
              UPPER(fak.nm_lemb) AS nm_fak,
              UPPER(prodi.nm_lemb) AS nm_prodi,
              jenj.nm_jenj_didik,
              ROW_NUMBER() OVER (PARTITION BY sdm.id_sdm ORDER BY aktf_ptk.id_reg_ptk DESC) AS row_num
          FROM
              pdrd.sdm AS sdm WITH (NOLOCK)
              JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK)
                  ON ptk.id_sdm = sdm.id_sdm
                  AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                  AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
              JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH (NOLOCK)
                  ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                  AND aktf_ptk.soft_delete = 0
                  AND aktf_ptk.a_sp_homebase = 1
                  AND aktf_ptk.id_thn_ajaran = " . $thn_iku . "
              LEFT JOIN pdrd.sms AS prodi WITH (NOLOCK)
                  ON prodi.id_sms = ptk.id_sms
                  AND prodi.soft_delete = 0
                  AND prodi.stat_prodi = 'A'
                  AND prodi.id_jns_sms = 3
              JOIN pdrd.sms AS fak WITH (NOLOCK)
                  ON fak.id_sms = prodi.id_fak_unila
                  AND fak.soft_delete = 0
                  AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
              JOIN ref.jenjang_pendidikan AS jenj WITH (NOLOCK)
                  ON jenj.id_jenj_didik = prodi.id_jenj_didik
                  AND jenj.expired_date IS NULL
          WHERE
              sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
              $where
      ),
      PublikasiTertinggi AS (
          SELECT
              sdm.id_sdm,
              sdm.nm_sdm,
              sdm.nidn,
              sdm.id_prodi,
              sdm.nm_prodi,
              sdm.nm_jenj_didik,
              sdm.id_fak,
              sdm.nm_fak,
              publikasi.id_publikasi,
              bobot.bobot,
              ROW_NUMBER() OVER (PARTITION BY sdm.id_sdm, tulis_pub.id_katgiat ORDER BY bobot.bobot DESC) AS row_num
          FROM
              AktifDosen AS sdm
              JOIN pdrd.tulis_pub AS tulis_pub WITH (NOLOCK)
                  ON tulis_pub.id_sdm = sdm.id_sdm
                  AND tulis_pub.soft_delete = 0
                  AND tulis_pub.id_katgiat IN (
                      '120101', '120102', '120103', '120104', '120105', '120106', '120107',
                      '120108', '120109', '120110', '120111', '120112', '120113', '120114',
                      '120115', '120117', '120118', '120119', '120120', '120121', '120122',
                      '120200', '120300', '120403', '120404', '120903', '120905', '120907',
                      '120909', '121300', '150100', '150201', '120400', '120500', '120700',
                      '120800', '121000', '121101', '121201', '120116', '120801', '120804',
                      '120807', '120810', '120901', '120902', '120701', '120704', '120705',
                      '120706', '120707', '120708', '120501', '120502', '120503', '120504',
                      '120401', '120402', '120405', '120406', '120407'
                  )
              JOIN pdrd.publikasi AS publikasi WITH (NOLOCK)
                  ON publikasi.id_publikasi = tulis_pub.id_publikasi
                  AND publikasi.soft_delete = 0
                  AND (publikasi.tgl_terbit >= '" . $thn_iku . "-01-01' AND publikasi.tgl_terbit <= '" . $thn_iku . "-12-31')
              LEFT JOIN temp_iku.bobot_iku_5 AS bobot WITH (NOLOCK)
                  ON bobot.id_katgiat = tulis_pub.id_katgiat
                  AND bobot.expired_date IS NULL
                  AND bobot.thn_ajaran = " . $thn_iku . "
          WHERE
              sdm.row_num = 1
      ),
      TotalDosen AS (
          SELECT DISTINCT
              sdm.id_sdm,
              sdm.nm_sdm,
              sdm.nidn,
              sdm.id_prodi,
              sdm.nm_prodi,
              sdm.nm_jenj_didik,
              sdm.id_fak,
              sdm.nm_fak
          FROM
              AktifDosen AS sdm
          WHERE
              sdm.row_num = 1
      )
      SELECT
          dosen.id_sdm,
          dosen.nm_sdm,
          dosen.nidn,
          dosen.id_prodi,
          dosen.nm_prodi,
          dosen.nm_jenj_didik,
          dosen.id_fak,
          dosen.nm_fak,
          COALESCE(pub.total_publikasi, 0) AS total_publikasi_tertinggi,
         COALESCE(FORMAT(pub.total_bobot, 'N1'), '0.0') AS total_bobot,
          COALESCE(COUNT(DISTINCT semua_publikasi.id_publikasi), 0) AS total_publikasi_semua
      FROM
          TotalDosen AS dosen
          LEFT JOIN (
              SELECT
                  id_sdm,
                  COUNT(DISTINCT id_publikasi) AS total_publikasi,
                  SUM(bobot) AS total_bobot
              FROM PublikasiTertinggi
              WHERE row_num = 1
              GROUP BY
                  id_sdm
          ) AS pub ON pub.id_sdm = dosen.id_sdm
          LEFT JOIN pdrd.tulis_pub AS tulis_pub WITH (NOLOCK)
              ON tulis_pub.id_sdm = dosen.id_sdm
              AND tulis_pub.soft_delete = 0
              AND tulis_pub.id_katgiat IN (
                  '120101', '120102', '120103', '120104', '120105', '120106', '120107',
                  '120108', '120109', '120110', '120111', '120112', '120113', '120114',
                  '120115', '120117', '120118', '120119', '120120', '120121', '120122',
                  '120200', '120300', '120403', '120404', '120903', '120905', '120907',
                  '120909', '121300', '150100', '150201', '120400', '120500', '120700',
                  '120800', '121000', '121101', '121201', '120116', '120801', '120804',
                  '120807', '120810', '120901', '120902', '120701', '120704', '120705',
                  '120706', '120707', '120708', '120501', '120502', '120503', '120504',
                  '120401', '120402', '120405', '120406', '120407'
              )
          LEFT JOIN pdrd.publikasi AS semua_publikasi WITH (NOLOCK)
              ON semua_publikasi.id_publikasi = tulis_pub.id_publikasi
              AND semua_publikasi.soft_delete = 0
              AND (semua_publikasi.tgl_terbit >= '" . $thn_iku . "-01-01' AND semua_publikasi.tgl_terbit <= '" . $thn_iku . "-12-31')
      GROUP BY
          dosen.id_sdm,
          dosen.nm_sdm,
          dosen.nidn,
          dosen.id_prodi,
          dosen.nm_prodi,
          dosen.nm_jenj_didik,
          dosen.id_fak,
          dosen.nm_fak,
          pub.total_publikasi,
          pub.total_bobot
      ORDER BY
          pub.total_bobot DESC ";

      $result = DB::select($select);

      foreach ($result as $key => $row) {
          $result[$key]->encrypted_id_sdm = \Crypt::encrypt($row->id_sdm);
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
