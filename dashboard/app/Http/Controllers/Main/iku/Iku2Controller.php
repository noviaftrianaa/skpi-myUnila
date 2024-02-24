<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2MbkmAgregatExport;
use App\Exports\IKU\TemplateIku2MbkmDetail;
use App\Exports\IKU\TemplateIku2Prestasi;

class Iku2Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function tahunIku()
  {
      $periodeAktif = DB::table('ref.semester')
      ->whereNull('expired_date')
      ->where('a_periode_aktif', 1)
      ->distinct()
      ->pluck('id_thn_ajaran')[0];
      $getPeriode = DB::table('ref.semester')
        ->whereNull('expired_date')
        ->where(DB::raw('RIGHT(id_smt,1)'), '<', '3')
        ->whereBetween('id_thn_ajaran', [$periodeAktif - 2, $periodeAktif])
        ->select('id_thn_ajaran', 'id_smt')
        ->orderByDesc('id_smt')
        ->get();
      return $periode = collect($getPeriode)->groupBy('id_thn_ajaran');
  }

  public function index()
  {
    $thn_iku = $this->tahunIku();
    return view('content.main.iku.iku-2.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
    $thn_iku = $this->request->thn_iku;
    $id_jns_sms = $this->request->id_jns_sms;
    $id_sms = $this->request->id_sms;
    $data = [];

    //mbkm
    $mbkm = $this->pointMbkm($thn_iku, $id_jns_sms, $id_sms);
    $point_a = $mbkm['count']['point_a'];
    $point_b = $mbkm['count']['point_b'];
    $peserta_mbkm = $mbkm['count']['peserta_mbkm'];
    $pembentuk_a = $mbkm['count']['pembentuk_a'];
    $pembentuk_b = $mbkm['count']['pembentuk_b'];
    $last_sync_ab = $mbkm['count']['last_sync_ab'];
    $rumus_ab = $mbkm['count']['rumus_ab'];
    $sumber_data_ab = $mbkm['count']['sumber_data_ab'];

    //prestasi
    $prestasi = $this->pointPrestasi($thn_iku, $id_jns_sms, $id_sms);
    $point_c = $prestasi['count']['total_point_c'];
    $total_prestasi_c = $prestasi['count']['total_prestasi_c'];
    $total_mhs_c = $prestasi['count']['total_mhs_c'];
    $pembentuk_c = $prestasi['count']['pembentuk_c'];
    $last_sync_c = $prestasi['count']['last_sync_c'];
    $rumus_c = $prestasi['count']['rumus_c'];
    $sumber_data_c = $prestasi['count']['sumber_data_c'];

    //total pencapaian
    if ($peserta_mbkm != 0) {
        $pencapaian_a = ($point_a / $peserta_mbkm) * 50;
        $pencapaian_b = ($point_b / $peserta_mbkm) * 20;
      } else {
        $pencapaian_a = 0;
        $pencapaian_b = 0;
      }
    if ($total_prestasi_c != 0) {
        $pencapaian_c = ($point_c / $total_mhs_c) * 30;
      } else {
        $pencapaian_c = 0;
    }
    $pencapaian = $pencapaian_a + $pencapaian_b + $pencapaian_c;
    $gold_standart = 20;
    $sub = $gold_standart - $pencapaian;
    $skor_pencapaian = $pencapaian / $gold_standart;

    //delta_gold_standart
    if($pencapaian > $gold_standart){
        $delta_gold_standart = abs($sub);
      }else{
        $delta_gold_standart = $sub;
      }

    $data['count'] = [
        'point_a' => number_format($point_a, 2),
        'point_b' => number_format($point_b, 2),
        'peserta_mbkm' => $peserta_mbkm,
        'pembentuk_a' => $pembentuk_a,
        'pembentuk_b' => $pembentuk_b,
        'last_sync_ab' => $last_sync_ab,
        'rumus_ab' => $rumus_ab,
        'sumber_data_ab' => $sumber_data_ab,
        'point_c' => number_format($point_c, 2),
        'total_prestasi_c' => $total_prestasi_c,
        'total_mhs_c' => $total_mhs_c,
        'pembentuk_c' => $pembentuk_c,
        'last_sync_c' => $last_sync_c,
        'rumus_c' => $rumus_c,
        'sumber_data_c' => $sumber_data_c,
        'pencapaian' => number_format($pencapaian, 2) . '%',
        'gold_standart' => number_format($gold_standart, 2) . '%',
        'delta_gold_standart' => number_format($delta_gold_standart, 2) . '%',
        'skor_pencapaian' => number_format($skor_pencapaian, 2) . '%',

    ];

    foreach ($mbkm['data'] as $index => $each_data) {
        $data['mbkm'][$index] = [
            'id_sms' => $each_data['id_sms'],
            'id_jns_sms' => $each_data['id_jns_sms'],
            'nm_lemb' => $each_data['nm_lemb'],
            'point_a' => $each_data['point_a'],
            'point_b' => $each_data['point_b'],
            'peserta_mbkm' => $each_data['peserta_mbkm'],
            'capaian' => $each_data['capaian']
        ];
    }

    foreach ($prestasi['data'] as $index => $each_data) {
        $data['prestasi'][$index] = [
            'id_sms' => $each_data['id_sms'],
            'id_jns_sms' => $each_data['id_jns_sms'],
            'nm_lemb' => $each_data['nm_lemb'],
            'total_point' => $each_data['total_point'],
            'total_prestasi' => $each_data['total_prestasi'],
            'total_mhs' => $each_data['total_mhs'],
            'capaian' => $each_data['capaian']
        ];
    }

    return response()->json($data);
  }

  public function pointMbkm($thn_iku, $id_jns_sms, $id_sms)
  {
    // if ($thn_iku == 2023) {
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
        $select = "
            SELECT
                lemb.id_sms,
                lemb.id_jns_sms,
                UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                COUNT(point_mbkm.id_reg_pd) AS total_peserta,
                SUM(point_mbkm.point_a) AS point_a,
                SUM(point_mbkm.point_b) AS point_b,
               	FORMAT(((SUM(point_mbkm.point_a) / COUNT(point_mbkm.id_reg_pd)) * 0.5) + ((SUM(point_mbkm.point_b) / COUNT(point_mbkm.id_reg_pd)) * 0.2), 'P') AS capaian
                FROM pdrd.sms AS lemb
        ";
        $join = "
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
                AND jenj.expired_date IS NULL
                LEFT JOIN (
                    SELECT
                        mbkm.id_sms,
                        mbkm.id_jenj_didik,
                        mbkm.id_reg_pd,
                        mbkm.konversi_a,
                        CASE
                            WHEN (mbkm.id_jenj_didik IN (22, 23, 30) AND mbkm.konversi_a >= 10) THEN CAST(mbkm.konversi_a / 20 AS DECIMAL(7, 2))
                            WHEN (mbkm.id_jenj_didik IN (20, 21) AND mbkm.konversi_a >= 5 ) THEN CAST(mbkm.konversi_a / 20 AS DECIMAL(7, 2))
                            ELSE 0
                        END AS point_a,
                        mbkm.konversi_b,
                        CASE
                            WHEN mbkm.konversi_b > 0 THEN CAST(mbkm.konversi_b / 20 AS DECIMAL(7, 2))
                            ELSE 0
                        END AS point_b
                    FROM
                        (
                            SELECT
                                reg.id_reg_pd,
                                prodi.id_sms,
                                jenj.id_jenj_didik,
                                (
                                    SELECT
                                        SUM(k_nilai.sks_mk) AS sks_konversi
                                    FROM
                                        mbkm.konversi_akt_mhs AS k_nilai
                                        JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                        AND ang_mbkm.soft_delete = 0
                                        JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                        AND akt_mbkm.soft_delete = 0
                                        JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                        AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                        ANd jns_akt.expired_date IS NULL
                                    WHERE
                                        akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                        AND akt_mbkm.id_jns_akt_mhs != 21
                                        AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                        AND k_nilai.soft_delete = 0
                                ) AS konversi_a,
                                (
                                    SELECT
                                        SUM(k_nilai_tf.sks_diakui) AS sks_konversi
                                    FROM
                                        mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                        JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                                        AND mk.soft_delete = 0
                                        JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                        AND akt_mbkm_tf.soft_delete = 0
                                        JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                        AND ang_mbkm_tf.soft_delete = 0
                                        JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                        AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                        ANd jns_akt.expired_date IS NULL
                                    WHERE
                                        k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                        AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                        AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                        AND k_nilai_tf.soft_delete = 0
                                ) AS konversi_b
                            FROM
                                pdrd.reg_pd AS reg WITH(NOLOCK)
                                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                                AND prodi.soft_delete = 0
                                AND prodi.stat_prodi = 'A'
                                AND prodi.id_sms NOT IN (
                                    '7cf61032-52b1-43b0-b9ec-316d838c735a',
                                    '225a5ae5-225e-482b-b379-521b6676c485',
                                    'abe8f1f8-bef0-4793-8ea3-6efac5794886'
                                )
                                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                                AND fak.soft_delete = 0
                                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                                AND jenj.expired_date IS NULL
                                AND jenj.id_jenj_didik IN(20, 21, 22, 23, 30)
                                JOIN (
                                    SELECT
                                        kul.id_reg_pd,
                                        SUM(kul.sks_semester) AS sks
                                    FROM
                                        pdrd.kuliah_mhs AS kul WITH(NOLOCK)
                                    WHERE
                                        kul.soft_delete = 0
                                        AND kul.id_stat_mhs = 'M'
                                        AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                    GROUP BY
                                        kul.id_reg_pd
                                ) AS mbkm ON mbkm.id_reg_pd = reg.id_reg_pd
                            WHERE
                                reg.soft_delete = 0
                                AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                                AND reg.soft_delete = 0
                        ) AS mbkm
                ) AS point_mbkm ON point_mbkm.id_sms = lemb.id_sms
            WHERE
                lemb.soft_delete = 0
        ";
        $where = "
            AND lemb.id_jns_sms = 3
            AND lemb.stat_prodi = 'A'
            AND lemb.id_jenj_didik IN (20, 21, 22, 23, 30)
            AND lemb.id_fak_unila = '" . $id_sms . "'
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
                COUNT(point_mbkm.id_reg_pd) AS total_peserta,
                SUM(point_mbkm.point_a) AS point_a,
                SUM(point_mbkm.point_b) AS point_b,
               	FORMAT(((SUM(point_mbkm.point_a) / COUNT(point_mbkm.id_reg_pd)) * 0.5) + ((SUM(point_mbkm.point_b) / COUNT(point_mbkm.id_reg_pd)) * 0.2), 'P') AS capaian
                FROM pdrd.sms AS lemb
        ";
        $join = "
                LEFT JOIN (
                    SELECT
                        mbkm.id_sms,
                        mbkm.id_jenj_didik,
                        mbkm.id_reg_pd,
                        mbkm.konversi_a,
                        CASE
                            WHEN (mbkm.id_jenj_didik IN (22, 23, 30) AND mbkm.konversi_a >= 10) THEN CAST(mbkm.konversi_a / 20 AS DECIMAL(7, 2))
                            WHEN (mbkm.id_jenj_didik IN (20, 21) AND mbkm.konversi_a >= 5 ) THEN CAST(mbkm.konversi_a / 20 AS DECIMAL(7, 2))
                            ELSE 0
                        END AS point_a,
                        mbkm.konversi_b,
                        CASE
                            WHEN mbkm.konversi_b > 0 THEN CAST(mbkm.konversi_b / 20 AS DECIMAL(7, 2))
                            ELSE 0
                        END AS point_b
                    FROM
                        (
                            SELECT
                                reg.id_reg_pd,
                                fak.id_sms,
                                jenj.id_jenj_didik,
                                (
                                    SELECT
                                        SUM(k_nilai.sks_mk) AS sks_konversi
                                    FROM
                                        mbkm.konversi_akt_mhs AS k_nilai
                                        JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                        AND ang_mbkm.soft_delete = 0
                                        JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                        AND akt_mbkm.soft_delete = 0
                                        JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                        AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                        ANd jns_akt.expired_date IS NULL
                                    WHERE
                                        akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                        AND akt_mbkm.id_jns_akt_mhs != 21
                                        AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                        AND k_nilai.soft_delete = 0
                                ) AS konversi_a,
                                (
                                    SELECT
                                        SUM(k_nilai_tf.sks_diakui) AS sks_konversi
                                    FROM
                                        mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                        JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                                        AND mk.soft_delete = 0
                                        JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                        AND akt_mbkm_tf.soft_delete = 0
                                        JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                        AND ang_mbkm_tf.soft_delete = 0
                                        JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                        AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                        ANd jns_akt.expired_date IS NULL
                                    WHERE
                                        k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                        AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                        AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                        AND k_nilai_tf.soft_delete = 0
                                ) AS konversi_b
                            FROM
                                pdrd.reg_pd AS reg WITH(NOLOCK)
                                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                                AND prodi.soft_delete = 0
                                AND prodi.stat_prodi = 'A'
                                AND prodi.id_sms NOT IN (
                                    '7cf61032-52b1-43b0-b9ec-316d838c735a',
                                    '225a5ae5-225e-482b-b379-521b6676c485',
                                    'abe8f1f8-bef0-4793-8ea3-6efac5794886'
                                )
                                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                                AND fak.soft_delete = 0
                                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                                AND jenj.expired_date IS NULL
                                AND jenj.id_jenj_didik IN(20, 21, 22, 23, 30)
                                JOIN (
                                    SELECT
                                        kul.id_reg_pd,
                                        SUM(kul.sks_semester) AS sks
                                    FROM
                                        pdrd.kuliah_mhs AS kul WITH(NOLOCK)
                                    WHERE
                                        kul.soft_delete = 0
                                        AND kul.id_stat_mhs = 'M'
                                        AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                    GROUP BY
                                        kul.id_reg_pd
                                ) AS mbkm ON mbkm.id_reg_pd = reg.id_reg_pd
                            WHERE
                                reg.soft_delete = 0
                                AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                                AND reg.soft_delete = 0
                        ) AS mbkm
                ) AS point_mbkm ON point_mbkm.id_sms = lemb.id_sms
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
        DB::select('SELECT last_sync AS time FROM mbkm.konversi_akt_mhs WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = array();
      $point_a = 0;
      $point_b = 0;
      $peserta_mbkm = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'Sistem Kampus Merdeka Universitas Lampung -> FEEDER PDDIKTI';

      foreach ($result as $index => $each_data) {
        $point_a += $each_data->point_a;
        $point_b += $each_data->point_b;
        $peserta_mbkm += $each_data->total_peserta;
        $pembentuk_a = '( '.$point_a . ' / ' . $peserta_mbkm .' ) * 50';
        $pembentuk_b = '( '.$point_b . ' / ' . $peserta_mbkm.' ) * 20';

        $iku['count'] = [
            'point_a' => $point_a,
            'point_b' => $point_b,
            'peserta_mbkm' => (int)$peserta_mbkm,
            'pembentuk_a' => $pembentuk_a,
            'pembentuk_b' => $pembentuk_b,
            'last_sync_ab' => tglWaktuIndonesia($last_sync->time),
            'rumus_ab' => $rumus,
            'sumber_data_ab' => $sumber_data,
        ];
        $iku['data'][$index] = [
            'id_sms' => $each_data->id_sms,
            'id_jns_sms' => $each_data->id_jns_sms,
            'nm_lemb' => $each_data->nm_lemb,
            'point_a' => $each_data->point_a,
            'point_b' => $each_data->point_b,
            'peserta_mbkm' => $each_data->total_peserta,
            'capaian' => $each_data->capaian,
        ];
      }

      return $iku;
    // } else {
    //   $result = [];
    //   return response()->json($result);
    // }
  }

  public function pointPrestasi($thn_iku, $id_jns_sms, $id_sms)
  {
    // if ($thn_iku == 2023) {
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
        $select = "
            SELECT
                lemb.id_sms,
                lemb.id_jns_sms,
                UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                COUNT (prestasi.id_prestasi) AS total_prestasi,
                COUNT(DISTINCT prestasi.id_reg_pd) AS total_mhs,
                SUM (prestasi.point) AS total_point,
                FORMAT(( NULLIF(SUM(prestasi.point), 0) / COUNT(DISTINCT prestasi.id_reg_pd) * 0.3),'P') AS capaian
                FROM pdrd.sms AS lemb
        ";
        $join = "
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
            AND jenj.expired_date IS NULL
            JOIN (
                SELECT
                    DISTINCT reg.id_reg_pd,
                    prodi.id_sms,
                    prestasi.id_prestasi,
                    CASE
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 1 THEN 1.0
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 2 THEN 0.9
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 3 THEN 0.8
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat IS NULL THEN 0.7
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 1 THEN 0.7
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 2 THEN 0.6
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 3 THEN 0.5
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 1 THEN 0.4
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 2 THEN 0.3
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 3 THEN 0.2
                    END AS point
                FROM
                    pdrd.reg_pd AS reg WITH(NOLOCK)
                    JOIN (
                        SELECT
                            id_reg_pd
                        FROM
                            pdrd.kuliah_mhs WITH(NOLOCK)
                        WHERE
                            soft_delete = 0
                            AND id_stat_mhs = 'A'
                            AND id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        GROUP BY
                            id_reg_pd
                    ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
                    JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                    AND prodi.stat_prodi = 'A'
                    AND prodi.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = prodi.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    LEFT JOIN (
                        SELECT
                            pres.id_pd,
                            pres.id_prestasi,
                            pres.id_tkt_prestasi,
                            pres.peringkat
                        FROM
                            pdrd.prestasi AS pres WITH(NOLOCK)
                        WHERE
                            pres.thn_prestasi = '". $thn_iku ."'
                            AND pres.soft_delete = 0
                    ) AS prestasi ON prestasi.id_pd = reg.id_pd
                WHERE
                    reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                    AND reg.soft_delete = 0
            ) AS prestasi ON prestasi.id_sms = lemb.id_sms
        ";
        $where = "
            AND lemb.id_jns_sms = 3
            AND lemb.stat_prodi = 'A'
            AND lemb.id_jenj_didik IN (20, 21, 22, 23, 30)
            AND lemb.id_fak_unila = '" . $id_sms . "'
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
                COUNT (prestasi.id_prestasi) AS total_prestasi,
                COUNT(DISTINCT prestasi.id_reg_pd) AS total_mhs,
                SUM (prestasi.point) AS total_point,
                FORMAT(( NULLIF(SUM(prestasi.point), 0) / COUNT(DISTINCT prestasi.id_reg_pd) * 0.3),'P') AS capaian
                FROM pdrd.sms AS lemb
        ";
        $join = "
            JOIN (
                SELECT
                    DISTINCT reg.id_reg_pd,
                    fak.id_sms,
                    prestasi.id_prestasi,
                    CASE
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 1 THEN 1.0
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 2 THEN 0.9
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 3 THEN 0.8
                        WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat IS NULL THEN 0.7
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 1 THEN 0.7
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 2 THEN 0.6
                        WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 3 THEN 0.5
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 1 THEN 0.4
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 2 THEN 0.3
                        WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 3 THEN 0.2
                    END AS point
                FROM
                    pdrd.reg_pd AS reg WITH(NOLOCK)
                    JOIN (
                        SELECT
                            id_reg_pd
                        FROM
                            pdrd.kuliah_mhs WITH(NOLOCK)
                        WHERE
                            soft_delete = 0
                            AND id_stat_mhs = 'A'
                            AND id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        GROUP BY
                            id_reg_pd
                    ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
                    JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                    AND prodi.stat_prodi = 'A'
                    AND prodi.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = prodi.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    LEFT JOIN (
                        SELECT
                            pres.id_pd,
                            pres.id_prestasi,
                            pres.id_tkt_prestasi,
                            pres.peringkat
                        FROM
                            pdrd.prestasi AS pres WITH(NOLOCK)
                            JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                            AND akt.soft_delete = 0
                        WHERE
                            pres.thn_prestasi = '". $thn_iku ."'
                            AND pres.soft_delete = 0
                    ) AS prestasi ON prestasi.id_pd = reg.id_pd
                WHERE
                    reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                    AND reg.soft_delete = 0
            ) AS prestasi ON prestasi.id_sms = lemb.id_sms
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
        DB::select('SELECT last_sync AS time FROM pdrd.prestasi WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = array();
      $total_point = 0;
      $total_prestasi = 0;
      $total_mhs = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'SIMKATMAWA Universitas Lampung -> FEEDER PDDIKTI';

      foreach ($result as $index => $each_data) {
        $total_point += $each_data->total_point;
        $total_prestasi += $each_data->total_prestasi;
        $total_mhs += $each_data->total_mhs;
        $pembentuk = '( '.$total_point . ' / ' . $total_mhs .' ) * 30';

        $iku['count'] = [
            'total_point_c' => $total_point,
            'total_prestasi_c' => (int)$total_prestasi,
            'total_mhs_c' => (int)$total_mhs,
            'pembentuk_c' => $pembentuk,
            'last_sync_c' => tglWaktuIndonesia($last_sync->time),
            'rumus_c' => $rumus,
            'sumber_data_c' => $sumber_data,
        ];
        $iku['data'][$index] = [
            'id_sms' => $each_data->id_sms,
            'id_jns_sms' => $each_data->id_jns_sms,
            'nm_lemb' => $each_data->nm_lemb,
            'total_point' => $each_data->total_point,
            'total_prestasi' => $each_data->total_prestasi,
            'total_mhs' => $each_data->total_mhs,
            'capaian' => $each_data->capaian,
        ];
      }

      return $iku;
    // } else {
    //   $result = [];
    //   return response()->json($result);
    // }
  }

  public function listRawData()
  {
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;

    $queryRawMbkm = $this->queryRawMbkm($thn_iku, $id_sms);
    $queryRawMbkmDetail = $this->queryRawMbkmDetail($thn_iku, $id_sms);
    $queryRawPrestasi = $this->queryRawPrestasi($thn_iku, $id_sms);
    $raw = [];

    foreach($queryRawMbkm AS $index => $each_mbkm){
        $raw['mbkm'][$index] = [
            'id_reg_pd' => $each_mbkm->id_reg_pd,
            'id_pd' => $each_mbkm->id_pd,
            'nipd' => $each_mbkm->nipd,
            'nm_pd' => $each_mbkm->nm_pd,
            'id_fak' => $each_mbkm->id_fak,
            'nm_fakultas' => $each_mbkm->nm_fakultas,
            'id_prodi' => $each_mbkm->id_prodi,
            'nm_prodi' => $each_mbkm->nm_prodi,
            'nm_jenj_didik' => $each_mbkm->nm_jenj_didik,
            'total_konversi' => $each_mbkm->total_konversi,
            'total_point' => number_format($each_mbkm->total_point, 2)
        ];
    }
    foreach($queryRawMbkmDetail AS $index => $each_mbkm_detail){
        $raw['mbkm_detail'][$index] = [
            'id_reg_pd' => $each_mbkm_detail->id_reg_pd,
            'id_pd' => $each_mbkm_detail->id_pd,
            'id_smt' => $each_mbkm_detail->id_smt,
            'nipd' => $each_mbkm_detail->nipd,
            'nm_pd' => $each_mbkm_detail->nm_pd,
            'id_fak' => $each_mbkm_detail->id_fak,
            'nm_fakultas' => $each_mbkm_detail->nm_fakultas,
            'id_prodi' => $each_mbkm_detail->id_prodi,
            'nm_prodi' => $each_mbkm_detail->nm_prodi,
            'nm_jenj_didik' => $each_mbkm_detail->nm_jenj_didik,
            'nm_jns_akt_mhs' => $each_mbkm_detail->nm_jns_akt_mhs,
            'judul_akt_mhs' => $each_mbkm_detail->judul_akt_mhs,
            'sks_konversi' => $each_mbkm_detail->sks_konversi
        ];
    }
    foreach($queryRawPrestasi AS $index => $each_prestasi){
        $raw['prestasi'][$index] = [
            'id_reg_pd' => $each_prestasi->id_reg_pd,
            'id_pd' => $each_prestasi->id_pd,
            'nipd' => $each_prestasi->nipd,
            'nm_pd' => $each_prestasi->nm_pd,
            'id_fak' => $each_prestasi->id_fak,
            'nm_fakultas' => $each_prestasi->nm_fakultas,
            'id_prodi' => $each_prestasi->id_prodi,
            'nm_prodi' => $each_prestasi->nm_prodi,
            'nm_jenj_didik' => $each_prestasi->nm_jenj_didik,
            'thn_prestasi' => $each_prestasi->thn_prestasi,
            'nm_prestasi' => $each_prestasi->nm_prestasi,
            'nm_tkt_prestasi' => $each_prestasi->nm_tkt_prestasi,
            'peringkat' => $each_prestasi->peringkat,
            'point' => $each_prestasi->point
        ];
    }
    return response()->json($raw);
  }

  public function queryRawMbkm($thn_iku, $id_sms)
  {
    if (!is_null($id_sms)) {
        $where = "
            WHERE
            al.id_prodi = '". $id_sms ."'
        ";
    } else {
        $where = "";
    }
    $select = "
        SELECT
            al.*,
            al.konversi_a + al.konversi_b AS total_konversi,
            al.point_a + al.point_b AS total_point
        FROM
            (
                SELECT
                    mbkm.id_reg_pd,
                    mbkm.id_pd,
                    mbkm.nipd,
                    mbkm.nm_pd,
                    mbkm.id_fak,
                    mbkm.nm_fakultas,
                    mbkm.id_prodi,
                    mbkm.nm_prodi,
                    mbkm.nm_jenj_didik,
                    CASE
                        WHEN (mbkm.id_jenj_didik IN (22, 23, 30) AND mbkm.konversi_a >= 10) THEN mbkm.konversi_a / 20
                        WHEN (mbkm.id_jenj_didik IN (20, 21) AND mbkm.konversi_a >= 5 ) THEN mbkm.konversi_a / 20
                        ELSE 0
                    END AS point_a,
                    CASE
                        WHEN mbkm.konversi_b > 0 THEN mbkm.konversi_b / 20
                        ELSE 0
                    END AS point_b,
                    CASE WHEN mbkm.konversi_a > 0 THEN mbkm.konversi_a ELSE 0 END AS konversi_a,
                    CASE WHEN mbkm.konversi_b > 0 THEN mbkm.konversi_b ELSE 0 END AS konversi_b
                FROM
                    (
                        SELECT
                            reg.id_reg_pd,
                            reg.id_pd,
                            reg.nipd,
                            pd.nm_pd,
                            fak.id_sms AS id_fak,
                            fak.nm_lemb AS nm_fakultas,
                            prodi.id_sms AS id_prodi,
                            prodi.nm_lemb AS nm_prodi,
                            jenj.nm_jenj_didik,
                            jenj.id_jenj_didik,
                            (
                                SELECT
                                    SUM(k_nilai.sks_mk) AS sks_konversi
                                FROM
                                    mbkm.konversi_akt_mhs AS k_nilai
                                    JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                    AND ang_mbkm.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                    AND akt_mbkm.soft_delete = 0
                                    JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                    AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                    ANd jns_akt.expired_date IS NULL
                                WHERE
                                    akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                    AND akt_mbkm.id_jns_akt_mhs != 21
                                    AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                    AND k_nilai.soft_delete = 0
                            ) AS konversi_a,
                            (
                                SELECT
                                    SUM(k_nilai_tf.sks_diakui) AS sks_konversi
                                FROM
                                    mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                    JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                                    AND mk.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                    AND akt_mbkm_tf.soft_delete = 0
                                    JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                    AND ang_mbkm_tf.soft_delete = 0
                                    JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                    AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                    ANd jns_akt.expired_date IS NULL
                                WHERE
                                    k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                    AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                    AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                    AND k_nilai_tf.soft_delete = 0
                            ) AS konversi_b
                        FROM
                            pdrd.reg_pd AS reg WITH(NOLOCK)
    ";
    $join = "
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
            AND pd.soft_delete = 0
            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
            AND prodi.soft_delete = 0
            AND prodi.stat_prodi = 'A'
            AND prodi.id_sms NOT IN (
                '7cf61032-52b1-43b0-b9ec-316d838c735a',
                '225a5ae5-225e-482b-b379-521b6676c485',
                'abe8f1f8-bef0-4793-8ea3-6efac5794886'
            )
            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
            AND fak.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
            AND jenj.expired_date IS NULL
            AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
            JOIN (
                SELECT
                    kul.id_reg_pd,
                    SUM(kul.sks_semester) AS sks
                FROM
                    pdrd.kuliah_mhs AS kul WITH(NOLOCK)
                WHERE
                    kul.soft_delete = 0
                    AND kul.id_stat_mhs = 'M'
                    AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                GROUP BY
                    kul.id_reg_pd
            ) AS mbkm ON mbkm.id_reg_pd = reg.id_reg_pd
            WHERE
            reg.soft_delete = 0
            AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
            AND reg.soft_delete = 0
            ) AS mbkm
        ) al
    ";
    $order_by = " ORDER BY total_point DESC, nm_pd ASC ";
    $queryRawMbkm = DB::select($select.$join.$where.$order_by);

    return $queryRawMbkm;
  }

  public function queryRawMbkmDetail($thn_iku, $id_sms)
  {
    if (!is_null($id_sms)) {
        $where = "
            WHERE
                reg.soft_delete = 0
                AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND reg.id_sms = '". $id_sms ."'
            ";

    } else {
        $where = "
            WHERE
                reg.soft_delete = 0
                AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND reg.soft_delete = 0
            ";
    }
    $select = "
        SELECT
            reg.id_reg_pd,
            reg.id_pd,
            kul.id_smt,
            reg.nipd,
            pd.nm_pd,
            fak.id_sms AS id_fak,
            fak.nm_lemb AS nm_fakultas,
            prodi.id_sms AS id_prodi,
            prodi.nm_lemb AS nm_prodi,
            jenj.nm_jenj_didik,
            CASE WHEN mbkm_a.nm_jns_akt_mhs IS NULL THEN mbkm_b.nm_jns_akt_mhs ELSE mbkm_a.nm_jns_akt_mhs END AS nm_jns_akt_mhs,
            CASE WHEN mbkm_a.judul_akt_mhs IS NULL THEN mbkm_b.judul_akt_mhs ELSE mbkm_a.judul_akt_mhs END AS judul_akt_mhs,
            CASE WHEN mbkm_a.sks_konversi IS NULL THEN mbkm_b.sks_konversi ELSE mbkm_a.sks_konversi END AS sks_konversi
        FROM
            pdrd.reg_pd AS reg WITH(NOLOCK)
    ";
    $join = "
        JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
        AND pd.soft_delete = 0
        JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
        AND prodi.soft_delete = 0
        AND prodi.stat_prodi = 'A'
        AND prodi.id_sms NOT IN (
            '7cf61032-52b1-43b0-b9ec-316d838c735a',
            '225a5ae5-225e-482b-b379-521b6676c485',
            'abe8f1f8-bef0-4793-8ea3-6efac5794886'
        )
        JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
        AND fak.soft_delete = 0
        JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
        AND jenj.expired_date IS NULL
        AND jenj.id_jenj_didik IN(20, 21, 22, 23, 30)
        JOIN (
            SELECT
                kul.id_reg_pd,
                kul.id_smt
            FROM
                pdrd.kuliah_mhs AS kul WITH(NOLOCK)
            WHERE
                kul.soft_delete = 0
                AND kul.id_stat_mhs = 'M'
                AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
        ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
        LEFT JOIN(
            SELECT
                akt_mbkm.id_smt,
                ang_mbkm.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                akt_mbkm.judul_akt_mhs,
                SUM(k_nilai.sks_mk) AS sks_konversi
            FROM
                mbkm.konversi_akt_mhs AS k_nilai
                JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                AND ang_mbkm.soft_delete = 0
                JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                AND akt_mbkm.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                ANd jns_akt.expired_date IS NULL
            WHERE
                akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                AND akt_mbkm.id_jns_akt_mhs != 21
                AND k_nilai.soft_delete = 0
            GROUP BY
                akt_mbkm.id_smt,
                ang_mbkm.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                akt_mbkm.judul_akt_mhs
        ) AS mbkm_a ON mbkm_a.id_smt = kul.id_smt
        AND mbkm_a.id_reg_pd = reg.id_reg_pd
        LEFT JOIN (
            SELECT
                akt_mbkm_tf.id_smt,
                ang_mbkm_tf.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                akt_mbkm_tf.judul_akt_mhs,
                SUM(k_nilai_tf.sks_diakui) AS sks_konversi
            FROM
                mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                AND mk.soft_delete = 0
                JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                AND akt_mbkm_tf.soft_delete = 0
                JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                AND ang_mbkm_tf.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                ANd jns_akt.expired_date IS NULL
            WHERE
                k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                AND akt_mbkm_tf.id_jns_akt_mhs = 21
                AND k_nilai_tf.soft_delete = 0
            GROUP BY
                akt_mbkm_tf.id_smt,
                ang_mbkm_tf.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                akt_mbkm_tf.judul_akt_mhs
        ) AS mbkm_b ON mbkm_b.id_smt = kul.id_smt
        AND mbkm_b.id_reg_pd = reg.id_reg_pd
    ";
    $order_by = "ORDER BY pd.nm_pd, reg.nipd, kul.id_smt ASC ";
    $queryRawMbkmDetail = DB::select($select.$join.$where.$order_by);

    return $queryRawMbkmDetail;
  }

  public function queryRawPrestasi($thn_iku, $id_sms)
  {
    if (!is_null($id_sms)) {
        $where = "
            WHERE
                reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND reg.soft_delete = 0
                AND reg.id_sms = '". $id_sms ."'
        ";
    } else {
        $where = "
            WHERE
                reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND reg.soft_delete = 0
        ";
    }
    $select = "
        SELECT
            reg.id_reg_pd,
            reg.id_pd,
            reg.nipd,
            pd.nm_pd,
            fak.id_sms AS id_fak,
            fak.nm_lemb AS nm_fakultas,
            prodi.id_sms AS id_prodi,
            prodi.nm_lemb AS nm_prodi,
            jenj.nm_jenj_didik,
            prestasi.thn_prestasi,
            prestasi.nm_prestasi,
            prestasi.nm_tkt_prestasi,
            prestasi.peringkat,
            CASE
                WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 1 THEN 1.0
                WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 2 THEN 0.9
                WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 3 THEN 0.8
                WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat IS NULL THEN 0.7
                WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 1 THEN 0.7
                WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 2 THEN 0.6
                WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 3 THEN 0.5
                WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 1 THEN 0.4
                WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 2 THEN 0.3
                WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 3 THEN 0.2
            END AS point
        FROM
            pdrd.reg_pd AS reg WITH(NOLOCK)
    ";
    $join = "
        JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
        AND pd.soft_delete = 0
        JOIN (
            SELECT
                id_reg_pd
            FROM
                pdrd.kuliah_mhs WITH(NOLOCK)
            WHERE
                soft_delete = 0
                AND id_stat_mhs = 'A'
                AND id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
            GROUP BY
                id_reg_pd
        ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
        JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
        AND prodi.stat_prodi = 'A'
        AND prodi.soft_delete = 0
        JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
        AND fak.soft_delete = 0
        JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
        AND jenj.expired_date IS NULL
        JOIN (
            SELECT
                pres.id_pd,
                pres.thn_prestasi,
                pres.id_tkt_prestasi,
                pres.peringkat,
                pres.nm_prestasi,
                tkt_prestasi.nm_tkt_prestasi
            FROM
                pdrd.prestasi AS pres WITH(NOLOCK)
                JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = pres.id_tkt_prestasi
                AND tkt_prestasi.expired_date IS NULL
            WHERE
                pres.thn_prestasi = '". $thn_iku ."'
                AND pres.soft_delete = 0
        ) AS prestasi ON prestasi.id_pd = reg.id_pd
    ";
    $order_by = " ORDER BY point DESC, pd.nm_pd ASC ";
    $queryRawPrestasi = DB::select($select.$join.$where.$order_by);

    return $queryRawPrestasi;
  }

  public function downloadRawData()
  {
    ini_set('max_execution_time', 0);
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;
    $jns_download = $this->request->jns_download;

    if($jns_download == "mbkm_agregat"){
        return Excel::download(new TemplateIku2MbkmAgregatExport($thn_iku, $id_sms), 'LAPORAN IKU 2 MBKM AGREGAT TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');
    }elseif($jns_download == "mbkm_detail"){
        return Excel::download(new TemplateIku2MbkmDetail($thn_iku, $id_sms), 'LAPORAN IKU 2 MBKM DETAIL TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');
    }elseif($jns_download == "prestasi"){
        return Excel::download(new TemplateIku2Prestasi($thn_iku, $id_sms), 'LAPORAN IKU 2 PRESTASI TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');
    }
  }
}
