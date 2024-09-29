<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2Export;

class Iku4Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }

  public function index()
  {
    $thn_iku = get_tahun_keaktifan();
    return view('content.main.iku.iku-4.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
        $thn_iku = $this->request->thn_iku;
        $id_jns_sms = $this->request->id_jns_sms;
        $id_sms = $this->request->id_sms;
        $data = [];

        //dosen sertifikasi
        $sertifikasi = $this->pointDosenSertif($thn_iku, $id_jns_sms, $id_sms);
        $total_sertifikasi_a = $sertifikasi['count']['total_sertifikasi'];
        $total_dosen_a = $sertifikasi['count']['total_dosen'];
        $pembentuk_a = $sertifikasi['count']['pembentuk'];
        $last_sync_a = $sertifikasi['count']['last_sync'];
        $rumus_ab = $sertifikasi['count']['rumus'];
        $sumber_ab = $sertifikasi['count']['sumber_data'];

        //dosen praktisi
        $praktisi = $this->pointDosenPraktisi($thn_iku, $id_jns_sms, $id_sms);
        $total_praktisi_b = $praktisi['count']['total_praktisi'];
        $total_dosen_b = $praktisi['count']['total_dosen'];
        $pembentuk_b = $praktisi['count']['pembentuk'];
        $last_sync_b = $praktisi['count']['last_sync'];

        //total pencapaian
        if ($total_dosen_a != 0) {
            $pencapaian_a = ($total_sertifikasi_a / $total_dosen_a) * 60;
        } else {
            $pencapaian_a = 0;
        }
        if ($total_dosen_b != 0) {
            $pencapaian_b = ($total_praktisi_b / $total_dosen_b) * 40;
        } else {
            $pencapaian_b = 0;
        }
        $pencapaian = $pencapaian_a + $pencapaian_b;
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
            'point_a' => $total_sertifikasi_a,
            'total_dosen_a' => $total_dosen_a,
            'pembentuk_a' => $pembentuk_a,
            'last_sync_a' => $last_sync_a,
            'point_b' => $total_praktisi_b,
            'total_dosen_b' => $total_dosen_b,
            'pembentuk_b' => $pembentuk_b,
            'last_sync_b' => $last_sync_b,
            'rumus_ab' => $rumus_ab,
            'sumber_ab' => $sumber_ab,
            'pencapaian' => number_format($pencapaian, 2) . '%',
            'gold_standart' => number_format($gold_standart, 2) . '%',
            'delta_gold_standart' => number_format($delta_gold_standart, 2) . '%',
            'skor_pencapaian' => number_format($skor_pencapaian, 2) . '%',

        ];

        foreach ($sertifikasi['data'] as $index => $each_data) {
            $data['sertifikasi'][$index] = [
                'id_sms' => $each_data['id_sms'],
                'id_jns_sms' => $each_data['id_jns_sms'],
                'nm_lemb' => $each_data['nm_lemb'],
                'point_a' => $each_data['total_sertifikasi'],
                'total_dosen_a' => $each_data['total_dosen'],
                'capaian_a' => $each_data['capaian']
            ];
        }

        foreach ($praktisi['data'] as $index => $each_data) {
            $data['praktisi'][$index] = [
                'id_sms' => $each_data['id_sms'],
                'id_jns_sms' => $each_data['id_jns_sms'],
                'nm_lemb' => $each_data['nm_lemb'],
                'point_b' => $each_data['total_praktisi'],
                'total_dosen_b' => $each_data['total_dosen'],
                'capaian_b' => $each_data['capaian']
            ];
        }

        return response()->json($data);

  }

    public function pointDosenSertif($thn_iku, $id_jns_sms, $id_sms)
    {
        if ($id_jns_sms == 3 && !is_null($id_sms)) {
            $select = "
                WITH RankedSdm AS (
                    SELECT
                        fil.id_sdm,
                        fil.id_sms,
                        MAX(fil.id_rwy_sert) AS id_rwy_sert,
                        ROW_NUMBER() OVER (PARTITION BY fil.id_sdm ORDER BY fil.id_sms) AS rn
                    FROM (
                        SELECT
                            sdm.id_sdm,
                            prodi.id_sms,
                            sertif.id_rwy_sert
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                            JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                            JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                            LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                            AND prodi.id_jns_sms = 3
                            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                            AND jenj.expired_date IS NULL
                            LEFT JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.soft_delete = 0
                            AND sp.stat_sp = 'A'
                            AND LEFT(sp.id_wil, 2) <> '99'
                            AND sp.npsn = '001026'
                            LEFT JOIN (
                                SELECT
                                    id_sdm,
                                    MAX(id_jenj_didik) AS id_jenj_didik
                                FROM
                                    pdrd.rwy_pend_formal
                                WHERE
                                    soft_delete = 0
                                    AND id_jenj_didik != 99
                                GROUP BY
                                    id_sdm
                            ) AS pend ON pend.id_sdm = sdm.id_sdm
                            AND pend.id_jenj_didik NOT IN (40, 41)
                            LEFT JOIN pdrd.rwy_sertifikasi AS sertif WITH(NOLOCK) ON sertif.id_sdm = sdm.id_sdm
                            AND sertif.soft_delete = 0
                            AND sertif.id_jns_sert NOT IN (1, 2, 3, 4)
                            AND sertif.thn_sert = $thn_iku
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN(1, 20, 24, 25, 27)
                    ) AS fil
                    GROUP BY
                        fil.id_sdm, fil.id_sms
                )
                SELECT
                    lemb.id_sms,
                    UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                    lemb.id_jns_sms,
                    COUNT(DISTINCT iku.id_sdm) AS total_dosen,
                    COUNT(DISTINCT iku.id_rwy_sert) AS total_sertifikasi,
                    FORMAT(
                        ROUND(
                            (NULLIF(COUNT(DISTINCT iku.id_rwy_sert), 0) * 1.0
                            / NULLIF(COUNT(DISTINCT iku.id_sdm), 0)) * 60,
                        2),
                        'N2'
                    ) + '%' AS capaian
                FROM pdrd.sms AS lemb
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN (
                    SELECT
                        id_sdm,
                        id_sms,
                        id_rwy_sert
                    FROM
                        RankedSdm
                    WHERE
                        rn = 1 -- Hanya ambil baris pertama untuk setiap id_sdm
                ) AS iku ON iku.id_sms = lemb.id_sms
                WHERE
                    lemb.soft_delete = 0
                    AND lemb.id_jns_sms = 3
                    AND lemb.stat_prodi = 'A'
                    AND lemb.id_fak_unila = '". $id_sms ."'
                GROUP BY
                    lemb.id_sms,
                    lemb.id_jns_sms,
                    lemb.nm_lemb,
                    jenj.nm_jenj_didik
            ";
        } else {
            $select = "
                WITH RankedSdm AS (
                    SELECT
                        fil.id_sdm,
                        fil.id_sms,
                        MAX(fil.id_rwy_sert) AS id_rwy_sert,
                        ROW_NUMBER() OVER (PARTITION BY fil.id_sdm ORDER BY fil.id_sms) AS rn
                    FROM (
                        SELECT
                            sdm.id_sdm,
                            fak.id_sms,
                            sertif.id_rwy_sert
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                            JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                            JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                            LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                            AND prodi.id_jns_sms = 3
                            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                            AND jenj.expired_date IS NULL
                            LEFT JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.soft_delete = 0
                            AND sp.stat_sp = 'A'
                            AND LEFT(sp.id_wil, 2) <> '99'
                            AND sp.npsn = '001026'
                            LEFT JOIN (
                                SELECT
                                    id_sdm,
                                    MAX(id_jenj_didik) AS id_jenj_didik
                                FROM
                                    pdrd.rwy_pend_formal
                                WHERE
                                    soft_delete = 0
                                    AND id_jenj_didik != 99
                                GROUP BY
                                    id_sdm
                            ) AS pend ON pend.id_sdm = sdm.id_sdm
                            AND pend.id_jenj_didik NOT IN (40, 41)
                            LEFT JOIN pdrd.rwy_sertifikasi AS sertif WITH(NOLOCK) ON sertif.id_sdm = sdm.id_sdm
                            AND sertif.soft_delete = 0
                            AND sertif.id_jns_sert NOT IN (1, 2, 3, 4)
                            AND sertif.thn_sert = $thn_iku
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN(1, 20, 24, 25, 27)
                    ) AS fil
                    GROUP BY
                        fil.id_sdm, fil.id_sms
                )
                SELECT
                    lemb.id_sms,
                    UPPER(lemb.nm_lemb) AS nm_lemb,
                    lemb.id_jns_sms,
                    COUNT(DISTINCT iku.id_sdm) AS total_dosen,
                    COUNT(DISTINCT iku.id_rwy_sert) AS total_sertifikasi,
                    FORMAT(
                        ROUND(
                            (NULLIF(COUNT(DISTINCT iku.id_rwy_sert), 0) * 1.0
                            / NULLIF(COUNT(DISTINCT iku.id_sdm), 0)) * 60,
                        2),
                        'N2'
                    ) + '%' AS capaian
                FROM pdrd.sms AS lemb
                JOIN (
                    SELECT
                        id_sdm,
                        id_sms,
                        id_rwy_sert
                    FROM
                        RankedSdm
                    WHERE
                        rn = 1 -- Hanya ambil baris pertama untuk setiap id_sdm
                ) AS iku ON iku.id_sms = lemb.id_sms
                WHERE
                    lemb.soft_delete = 0
                    AND lemb.id_jns_sms = 1
                GROUP BY
                    lemb.id_sms,
                    lemb.id_jns_sms,
                    lemb.nm_lemb
            ";
        }

        $result = DB::select($select);
        $last_sync = collect(DB::select('SELECT last_sync AS time FROM pdrd.rwy_sertifikasi WHERE soft_delete=0 ORDER BY last_sync DESC'))->first();

        $iku = [];
        $total_sertifikasi = 0;
        $total_dosen = 0;
        $rumus = 'Kepdirjen 173/E/KPT/2023';
        $sumber_data = 'SISTER UNILA - SISTER PDDIKTI';

        foreach ($result as $index => $each_data) {
            $total_sertifikasi += $each_data->total_sertifikasi;
            $total_dosen += $each_data->total_dosen;
            $pembentuk = '( '.$total_sertifikasi . ' / ' . $total_dosen .' ) * 60';
            $pencapaian = ($total_dosen != 0) ? ($total_sertifikasi / $total_dosen) * 60 : 0;
            $gold_standart = 20;
            $sub = $gold_standart - $pencapaian;
            $delta_gold_standart = ($pencapaian > $gold_standart) ? abs($sub) : $sub;
            $skor_pencapaian = $pencapaian / $gold_standart;

            $iku['count'] = [
                'total_sertifikasi' => $total_sertifikasi,
                'total_dosen' => $total_dosen,
                'pembentuk' => $pembentuk,
                'last_sync' => tglWaktuIndonesia($last_sync->time),
                'rumus' => $rumus,
                'sumber_data' => $sumber_data,
            ];

            $iku['data'][$index] = [
                'id_sms' => $each_data->id_sms,
                'id_jns_sms' => $each_data->id_jns_sms,
                'nm_lemb' => $each_data->nm_lemb,
                'total_sertifikasi' => $each_data->total_sertifikasi,
                'total_dosen' => $each_data->total_dosen,
                'capaian' => $each_data->capaian,
            ];
        }

        return $iku;
    }

    public function pointDosenPraktisi($thn_iku, $id_jns_sms, $id_sms)
    {
        if ($id_jns_sms == 3 && !is_null($id_sms)) {
            $select = "
                WITH RankedSdm AS (
                    SELECT
                        dt.id_sdm,
                        prodi.id_sms,
                        CASE WHEN dp.id_sdm IS NOT NULL THEN 1 ELSE 0 END AS total_praktisi,
                        ROW_NUMBER() OVER (PARTITION BY dt.id_sdm ORDER BY prodi.id_sms) AS rn
                    FROM (
                        SELECT
                            sdm.id_sdm,
                            prodi.id_sms
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                        JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                        JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                        JOIN pdrd.sms AS fak WITH (NOLOCK)
                            ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
                        LEFT JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.soft_delete = 0
                            AND sp.stat_sp = 'A'
                            AND LEFT(sp.id_wil, 2) <> '99'
                            AND sp.npsn = '001026'
                        LEFT JOIN (
                            SELECT
                                id_sdm,
                                MAX(id_jenj_didik) AS id_jenj_didik
                            FROM
                                pdrd.rwy_pend_formal
                            WHERE
                                soft_delete = 0
                                AND id_jenj_didik != 99
                            GROUP BY
                                id_sdm
                        ) AS pend ON pend.id_sdm = sdm.id_sdm
                        AND pend.id_jenj_didik NOT IN (40, 41)
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                    ) AS dt
                    LEFT JOIN (
                        SELECT
                            sdm.id_sdm,
                            prodi.id_sms
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                        JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                        LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                        JOIN pdrd.sms AS fak WITH (NOLOCK)
                            ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
                        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.npsn = '001026'
                        WHERE
                            LEFT(sdm.nidn, 2) IN ('88', '89')
                            AND sdm.nidn != '8955910021'
                    ) AS dp ON dp.id_sdm = dt.id_sdm
                    LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = dt.id_sms
                        AND prodi.soft_delete = 0
                        AND prodi.stat_prodi = 'A'
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                        AND fak.soft_delete = 0
                )
                SELECT
                    lemb.id_sms,
                    UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                    lemb.id_jns_sms,
                    COUNT(DISTINCT iku.id_sdm) AS total_dosen,
                    COUNT(DISTINCT CASE WHEN iku.total_praktisi = 1 THEN iku.id_sdm END) AS total_praktisi,
                    FORMAT(
                        ROUND(
                            (NULLIF(COUNT(DISTINCT CASE WHEN iku.total_praktisi = 1 THEN iku.id_sdm END), 0) * 1.0
                            / NULLIF(COUNT(DISTINCT iku.id_sdm), 0)) * 40,
                        2),
                        'N2'
                    ) + '%' AS capaian
                FROM pdrd.sms AS lemb
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
                    AND jenj.expired_date IS NULL
                JOIN (
                    SELECT
                        id_sdm,
                        id_sms,
                        total_praktisi
                    FROM
                        RankedSdm
                    WHERE rn = 1 -- Ambil baris pertama untuk setiap id_sdm
                ) AS iku ON iku.id_sms = lemb.id_sms
                WHERE
                    lemb.soft_delete = 0
                    AND lemb.id_jns_sms = 3
                    AND lemb.stat_prodi = 'A'
                    AND lemb.id_fak_unila = '". $id_sms ."'
                GROUP BY
                    lemb.id_sms,
                    lemb.id_jns_sms,
                    lemb.nm_lemb,
                    jenj.nm_jenj_didik
            ";
        } else {
            $select = "
                WITH RankedSdm AS (
                    SELECT
                        dt.id_sdm,
                        fak.id_sms,
                        CASE WHEN dp.id_sdm IS NOT NULL THEN 1 ELSE 0 END AS total_praktisi,
                        ROW_NUMBER() OVER (PARTITION BY dt.id_sdm ORDER BY fak.id_sms) AS rn
                    FROM (
                        SELECT
                            sdm.id_sdm,
                            prodi.id_sms
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                        JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                        LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                        JOIN pdrd.sms AS fak WITH (NOLOCK)
                            ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
                        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.soft_delete = 0
                            AND sp.stat_sp = 'A'
                            AND LEFT(sp.id_wil, 2) <> '99'
                            AND sp.npsn = '001026'
                        LEFT JOIN (
                            SELECT
                                id_sdm,
                                MAX(id_jenj_didik) AS id_jenj_didik
                            FROM
                                pdrd.rwy_pend_formal
                            WHERE
                                soft_delete = 0
                                AND id_jenj_didik != 99
                            GROUP BY
                                id_sdm
                        ) AS pend ON pend.id_sdm = sdm.id_sdm
                        AND pend.id_jenj_didik NOT IN (40, 41)
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                    ) AS dt
                    LEFT JOIN (
                        SELECT
                            sdm.id_sdm,
                            prodi.id_sms
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                        JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                        LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                        JOIN pdrd.sms AS fak WITH (NOLOCK)
                        ON fak.id_sms = prodi.id_fak_unila
                        AND fak.soft_delete = 0
                        AND fak.id_sms NOT IN ('61752f1d-2cd6-4186-a2da-8189e2c3bc0c')
                        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ptk.id_sp
                            AND sp.npsn = '001026'
                        WHERE
                            LEFT(sdm.nidn, 2) IN ('88', '89')
                            AND sdm.nidn != '8955910021'
                    ) AS dp ON dp.id_sdm = dt.id_sdm
                    LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = dt.id_sms
                        AND prodi.soft_delete = 0
                        AND prodi.stat_prodi = 'A'
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                        AND fak.soft_delete = 0
                )
                SELECT
                    lemb.id_sms,
                    UPPER(lemb.nm_lemb) AS nm_lemb,
                    lemb.id_jns_sms,
                    COUNT(DISTINCT iku.id_sdm) AS total_dosen,
                    COUNT(DISTINCT CASE WHEN iku.total_praktisi = 1 THEN iku.id_sdm END) AS total_praktisi,
                    FORMAT(
                        ROUND(
                            (NULLIF(COUNT(DISTINCT CASE WHEN iku.total_praktisi = 1 THEN iku.id_sdm END), 0) * 1.0
                            / NULLIF(COUNT(DISTINCT iku.id_sdm), 0)) * 40,
                        2),
                        'N2'
                    ) + '%' AS capaian
                FROM pdrd.sms AS lemb
                JOIN (
                    SELECT
                        id_sdm,
                        id_sms,
                        total_praktisi
                    FROM
                        RankedSdm
                    WHERE rn = 1 -- Ambil baris pertama untuk setiap id_sdm
                ) AS iku ON iku.id_sms = lemb.id_sms
                WHERE
                    lemb.soft_delete = 0
                    AND lemb.id_jns_sms = 1
                GROUP BY
                    lemb.id_sms,
                    lemb.id_jns_sms,
                    lemb.nm_lemb
            ";
        }

        $result = DB::select($select);
        $last_sync = collect(DB::select('SELECT last_sync AS time FROM pdrd.sdm WHERE soft_delete=0 ORDER BY last_sync DESC'))->first();

        $iku = [];
        $total_praktisi = 0;
        $total_dosen = 0;
        $rumus = 'Kepdirjen 173/E/KPT/2023';
        $sumber_data = 'SISTER UNILA - SISTER PDDIKTI';

        foreach ($result as $index => $each_data) {
            $total_praktisi += $each_data->total_praktisi;
            $total_dosen += $each_data->total_dosen;
            $pembentuk = '( '.$total_praktisi . ' / ' . $total_dosen .' ) * 40';
            $pencapaian = ($total_dosen != 0) ? ($total_praktisi / $total_dosen) * 40 : 0;
            $gold_standart = 20;
            $sub = $gold_standart - $pencapaian;
            $delta_gold_standart = ($pencapaian > $gold_standart) ? abs($sub) : $sub;
            $skor_pencapaian = $pencapaian / $gold_standart;

            $iku['count'] = [
                'total_praktisi' => $total_praktisi,
                'total_dosen' => $total_dosen,
                'pembentuk' => $pembentuk,
                'last_sync' => tglWaktuIndonesia($last_sync->time),
                'rumus' => $rumus,
                'sumber_data' => $sumber_data,
            ];
            $iku['data'][$index] = [
                'id_sms' => $each_data->id_sms,
                'id_jns_sms' => $each_data->id_jns_sms,
                'nm_lemb' => $each_data->nm_lemb,
                'total_praktisi' => $each_data->total_praktisi,
                'total_dosen' => $each_data->total_dosen,
                'capaian' => $each_data->capaian,
            ];
        }

        return $iku;
    }

  public function listRawData()
  {
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;

    $queryRawDosenSertif = $this->queryRawDosenSertif($thn_iku, $id_sms);
    $queryRawDosenPraktisi = $this->queryRawDosenPraktisi($thn_iku, $id_sms);
    $raw = [];

    foreach($queryRawDosenSertif AS $index => $each_sertif){
        $raw['sertifikasi'][$index] = [
            'id_sdm' => $each_sertif->id_sdm,
            'nidn' => $each_sertif->nidn,
            'nm_sdm' => $each_sertif->nm_sdm,
            'id_fak' => $each_sertif->id_fak,
            'nm_fakultas' => $each_sertif->nm_fak,
            'id_prodi' => $each_sertif->id_prodi,
            'nm_prodi' => $each_sertif->nm_prodi,
            'nm_jenj_didik' => $each_sertif->nm_jenj_didik,
            'total_sertifikasi' => $each_sertif->id_rwy_sert,
        ];
    }
    foreach($queryRawDosenPraktisi AS $index => $each_praktisi){
        $raw['praktisi'][$index] = [
            'id_sdm' => $each_praktisi->id_sdm,
            'nidn' => $each_praktisi->nidn,
            'nm_sdm' => $each_praktisi->nm_sdm,
            'id_fak' => $each_praktisi->id_fak,
            'nm_fakultas' => $each_praktisi->nm_fak,
            'id_prodi' => $each_praktisi->id_prodi,
            'nm_prodi' => $each_praktisi->nm_prodi,
            'nm_jenj_didik' => $each_praktisi->nm_jenj_didik,
            'total_praktisi' => $each_praktisi->total_praktisi
        ];
    }

    return response()->json($raw);
  }

  public function queryRawDosenSertif($thn_iku, $id_sms)
  {
    if (!is_null($id_sms)) {
        $where = "
            WHERE
                sdm.id_jns_sdm = 12
                AND sdm.soft_delete = 0
                AND sdm.id_stat_aktif IN(1, 20, 24, 25, 27)
                AND ptk.id_sms = '". $id_sms ."'
            ) AS fil
            GROUP BY
                fil.id_sdm,
                fil.nidn,
                fil.nm_sdm,
                fil.id_prodi,
                fil.nm_prodi,
                fil.nm_jenj_didik,
                fil.id_fak,
                fil.nm_fak
        ";

    } else {
        $where = "
                WHERE
                    sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                    AND sdm.id_stat_aktif IN(1, 20, 24, 25, 27)
            ) AS fil
             GROUP BY
                fil.id_sdm,
                fil.nidn,
                fil.nm_sdm,
                fil.id_prodi,
                fil.nm_prodi,
                fil.nm_jenj_didik,
                fil.id_fak,
                fil.nm_fak
        ";
    }
    $select = "
        SELECT
            fil.id_sdm,
            fil.nidn,
            fil.nm_sdm,
            fil.id_prodi,
            fil.nm_prodi,
            fil.nm_jenj_didik,
            fil.id_fak,
            fil.nm_fak,
            COUNT(fil.id_rwy_sert) AS id_rwy_sert
        FROM
    ";
    $join = "
        (
            SELECT
                sdm.id_sdm,
                sdm.nidn,
                sdm.nm_sdm,
                prodi.id_sms AS id_prodi,
                prodi.nm_lemb AS nm_prodi,
                jenj.nm_jenj_didik,
                fak.id_sms AS id_fak,
                fak.nm_lemb AS nm_fak,
                sertif.id_rwy_sert
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktf_ptk.soft_delete = 0
                AND aktf_ptk.a_sp_homebase = 1
                AND aktf_ptk.id_thn_ajaran = $thn_iku
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                AND prodi.stat_prodi = 'A'
                AND prodi.id_jns_sms = 3
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                LEFT JOIN pdrd.satuan_pendidikan AS sp WITH (NOLOCK) ON sp.id_sp = ptk.id_sp
                AND sp.soft_delete = 0
                AND sp.stat_sp = 'A'
                AND LEFT(sp.id_wil, 2) <> '99'
                AND sp.npsn = '001026'
                LEFT JOIN (
                    SELECT
                        id_sdm,
                        MAX(id_jenj_didik) AS id_jenj_didik
                    FROM
                        pdrd.rwy_pend_formal
                    WHERE
                        soft_delete = 0
                        AND id_jenj_didik != 99
                    GROUP BY
                        id_sdm
                ) AS pend ON pend.id_sdm = sdm.id_sdm
                AND pend.id_jenj_didik NOT IN (40, 41)
                LEFT JOIN pdrd.rwy_sertifikasi AS sertif WITH (NOLOCK) ON sertif.id_sdm = sdm.id_sdm
                AND sertif.soft_delete = 0
                AND sertif.id_jns_sert NOT IN (1, 2, 3, 4)
                AND sertif.thn_sert = $thn_iku
    ";
    $order_by = "ORDER BY fil.nm_sdm ASC ";
    $queryRawDosenSertif = DB::select($select.$join.$where.$order_by);

    return $queryRawDosenSertif;
  }

  public function queryRawDosenPraktisi($thn_iku, $id_sms)
  {
    if (!is_null($id_sms)) {
        $where = "
            WHERE
                dt.id_sms = '". $id_sms ."'
        ";
    } else {
        $where = "";
    }
    $select = "
        SELECT
            dt.id_sdm,
            dt.nidn,
            dt.nm_sdm,
            prodi.id_sms AS id_prodi,
            prodi.nm_lemb AS nm_prodi,
            jenj.nm_jenj_didik,
            fak.id_sms AS id_fak,
            fak.nm_lemb AS nm_fak,
            CASE
                WHEN dp.id_sdm IS NOT NULL THEN 1
                ELSE 0
            END AS total_praktisi
        FROM
    ";
    $join = "
            (
            -- Subquery for total dosen
            SELECT
                sdm.id_sdm,
                sdm.nidn,
                sdm.nm_sdm,
                prodi.id_sms
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktf_ptk.soft_delete = 0
                AND aktf_ptk.a_sp_homebase = 1
                AND aktf_ptk.id_thn_ajaran = $thn_iku
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                AND prodi.stat_prodi = 'A'
                AND prodi.id_jns_sms = 3
                LEFT JOIN pdrd.satuan_pendidikan AS sp WITH (NOLOCK) ON sp.id_sp = ptk.id_sp
                AND sp.soft_delete = 0
                AND sp.stat_sp = 'A'
                AND LEFT(sp.id_wil, 2) <> '99'
                AND sp.npsn = '001026'
                LEFT JOIN (
                    SELECT
                        id_sdm,
                        MAX(id_jenj_didik) AS id_jenj_didik
                    FROM
                        pdrd.rwy_pend_formal
                    WHERE
                        soft_delete = 0
                        AND id_jenj_didik != 99
                    GROUP BY
                        id_sdm
                ) AS pend ON pend.id_sdm = sdm.id_sdm
                AND pend.id_jenj_didik NOT IN (40, 41)
            WHERE
                sdm.id_jns_sdm = 12
                AND sdm.soft_delete = 0
                AND sdm.id_stat_aktif IN (1, 20, 24, 25, 27)
        ) AS dt
        LEFT JOIN (
            -- Subquery for dosen praktisi
            SELECT
                sdm.id_sdm,
                prodi.id_sms
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktf_ptk.soft_delete = 0
                AND aktf_ptk.a_sp_homebase = 1
                AND aktf_ptk.id_thn_ajaran = $thn_iku
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                AND prodi.stat_prodi = 'A'
                AND prodi.id_jns_sms = 3
                JOIN pdrd.satuan_pendidikan AS sp WITH (NOLOCK) ON sp.id_sp = ptk.id_sp
                AND sp.npsn = '001026'
            WHERE
                LEFT(sdm.nidn, 2) IN ('88', '89')
                AND sdm.nidn != '8955910021'
        ) AS dp ON dp.id_sdm = dt.id_sdm
        LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = dt.id_sms
        AND prodi.soft_delete = 0
        AND prodi.stat_prodi = 'A'
        LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
        AND fak.soft_delete = 0
        JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
        AND jenj.expired_date IS NULL
    ";
    $order_by = " ORDER BY dt.nm_sdm ASC ";
    $queryRawDosenPraktisi = DB::select($select.$join.$where.$order_by);

    return $queryRawDosenPraktisi;
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
