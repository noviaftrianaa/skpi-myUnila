<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2Export;

class Iku3Controller extends Controller
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
    return view('content.main.iku.iku-3.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
    $thn_iku = $this->request->thn_iku;
    $id_jns_sms = $this->request->id_jns_sms;
    $id_sms = $this->request->id_sms;

    // if ($thn_iku == $thn_iku) {
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
        $select = "
            SELECT
                lemb.id_sms,
                UPPER(CONCAT(lemb.nm_lemb, ' (', jenj.nm_jenj_didik, ')')) AS nm_lemb,
                lemb.id_jns_sms,
                SUM(iku.tridharma) AS point_tridharma,
                SUM(iku.praktisi) AS point_praktisi,
                SUM(iku.bimbing_prestasi) AS point_bimbing_prestasi,
                COUNT(iku.id_sdm) AS total_dosen,
                SUM(iku.total_point) AS total_point,
                FORMAT((NULLIF(SUM(iku.total_point), 0) / COUNT(iku.id_sdm)), 'P') AS capaian
            FROM
                pdrd.sms AS lemb
        ";
        $join = "
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = lemb.id_jenj_didik
            AND jenj.expired_date IS NULL
            JOIN (
                SELECT
                    fil.id_sdm,
                    fil.nip,
                    fil.nm_sdm,
                    fil.id_sms,
                    fil.tridharma,
                    fil.praktisi,
                    fil.bimbing_prestasi,
                    (
                        SELECT
                            MAX(total_point)
                        FROM
                            (
                                VALUES
                                    (fil.tridharma),
                                    (fil.praktisi),
                                    (fil.bimbing_prestasi)
                            ) AS total(total_point)
                    ) AS total_point
                FROM
                    (
                        SELECT
                            sdm.id_sdm,
                            sdm.nip,
                            sdm.nidn,
                            sdm.nm_sdm,
                            prodi.id_sms,
                            CASE
                                WHEN litabmas.total > 0
                                OR mengajar.total > 0
                                OR pembimbing.total > 0
                                OR menguji.total > 0 THEN 1
                                ELSE 0
                            END AS tridharma,
                            CASE
                                WHEN praktisi.total > 0 THEN 1
                                ELSE 0
                            END AS praktisi,
                            CASE
                                WHEN prestasi.total > 0 THEN 0.75
                                ELSE 0
                            END AS bimbing_prestasi
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                            JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                            AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                            JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                            LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                            AND jenj.expired_date IS NULL
                            LEFT JOIN (
                                SELECT
                                    ang_lit.id_sdm,
                                    COUNT(lit.id_litabmas) AS total
                                FROM
                                    pdrd.litabmas AS lit WITH(NOLOCK)
                                    JOIN pdrd.sdm_anggota_litabmas AS ang_lit ON ang_lit.id_litabmas = lit.id_litabmas
                                    AND ang_lit.soft_delete = 0
                                WHERE
                                    lit.soft_delete = 0
                                    AND (
                                        lit.id_lemb_iptek != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                        OR lit.lokasi_kegiatan LIKE '%LK%'
                                    )
                                    AND lit.id_thn_kegiatan >= ($thn_iku - 5)
                                GROUP BY
                                    ang_lit.id_sdm
                            ) AS litabmas ON litabmas.id_sdm = sdm.id_sdm
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    COUNT(akt_ajar.id_reg_ptk) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.akt_ajar_dosen AS akt_ajar ON akt_ajar.id_reg_ptk = ptk.id_reg_ptk
                                    AND akt_ajar.soft_delete = 0
                                    JOIN pdrd.kelas_kuliah AS kls ON kls.id_kls = akt_ajar.id_kls
                                    AND kls.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = kls.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm
                            ) AS mengajar ON mengajar.id_sdm = sdm.id_sdm
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(bimbing_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.bimbing_mhs AS bimbing_mhs ON bimbing_mhs.id_sdm = ptk.id_sdm
                                    AND bimbing_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = bimbing_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.sms AS sms ON sms.id_sms = akt.id_sms
                                    AND sms.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND sms.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS pembimbing ON pembimbing.id_sdm = sdm.id_sdm
                            AND pembimbing.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(uji_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.uji_mhs AS uji_mhs ON uji_mhs.id_sdm = ptk.id_sdm
                                    AND uji_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = uji_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.sms AS sms ON sms.id_sms = akt.id_sms
                                    AND sms.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND sms.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS menguji ON menguji.id_sdm = sdm.id_sdm
                            AND menguji.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(ptk.id_sdm) AS total
                                FROM
                                    pdrd.rwy_pekerjaan AS rwy_kerja WITH(NOLOCK)
                                    JOIN (
                                        select
                                            p.id_sdm,
                                            max(p.waktu) as waktu,
                                            max(p.id_rwy_kerja) as id_rwy_kerja
                                        from
                                            (
                                                select
                                                    RANK() OVER (
                                                        PARTITION BY x.id_sdm
                                                        ORDER BY
                                                            x.waktu DESC,
                                                            x.last_update DESC
                                                    ) AS Rank,
                                                    x.id_sdm,
                                                    x.waktu,
                                                    x.id_rwy_kerja,
                                                    x.last_update
                                                from
                                                    (
                                                        select
                                                            case
                                                                when selesai_bekerja is null then DATEDIFF(day, mulai_bekerja, getdate()) / 365.2425
                                                                else DATEDIFF(day, mulai_bekerja, selesai_bekerja) / 365.2425
                                                            end as waktu,
                                                            *
                                                        from
                                                            pdrd.rwy_pekerjaan
                                                        where
                                                            soft_delete = 0
                                                    ) as x
                                            ) as p
                                        where
                                            p.Rank <= 1
                                            and p.waktu >= 0.5
                                        group by
                                            p.id_sdm
                                    ) AS rwy_waktu on rwy_waktu.id_rwy_kerja = rwy_kerja.id_rwy_kerja
                                    JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = rwy_waktu.id_sdm
                                    AND ptk.soft_delete = 0
                                    JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = ptk.id_sp
                                    AND sp.soft_delete = 0
                                    AND sp.stat_sp = 'A'
                                    JOIN pdrd.lembaga_non_sp AS lemb_non_sp ON lemb_non_sp.id_lemb_non_sp = sp.id_pembina
                                    AND lemb_non_sp.soft_delete = 0
                                WHERE
                                    rwy_kerja.soft_delete = 0
                                    AND rwy_waktu.waktu >= 0.5
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS praktisi ON praktisi.id_sdm = sdm.id_sdm
                            AND praktisi.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(bimbing_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.bimbing_mhs AS bimbing_mhs ON bimbing_mhs.id_sdm = ptk.id_sdm
                                    AND bimbing_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = bimbing_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.prestasi AS prestasi ON prestasi.id_akt_mhs = akt.id_akt_mhs
                                    AND prestasi.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran = ($thn_iku - 1)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS prestasi ON prestasi.id_sdm = sdm.id_sdm
                            AND prestasi.id_reg_ptk = aktf_ptk.id_reg_ptk
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                            AND LEFT(sdm.nidn, 2) < '88'
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                    ) AS fil
            ) AS iku ON iku.id_sms = lemb.id_sms
        ";
        $where = "
            WHERE
                lemb.soft_delete = 0
                AND lemb.id_jns_sms = 3
                AND lemb.stat_prodi = 'A'
                AND lemb.id_fak_unila = '". $id_sms ."'
        ";
        $group_by = "
            GROUP BY
                lemb.id_sms,
                lemb.id_jns_sms,
                lemb.nm_lemb,
                jenj.nm_jenj_didik
        ";
      } else {
        $select = "
            SELECT
                lemb.id_sms,
                lemb.id_jns_sms,
                UPPER(lemb.nm_lemb) AS nm_lemb,
                SUM(iku.tridharma) AS point_tridharma,
                SUM(iku.praktisi) AS point_praktisi,
                SUM(iku.bimbing_prestasi) AS point_bimbing_prestasi,
                COUNT(iku.id_sdm) AS total_dosen,
                SUM(iku.total_point) AS total_point,
                FORMAT((NULLIF(SUM(iku.total_point), 0) / COUNT(iku.id_sdm)), 'P') AS capaian
            FROM
                pdrd.sms AS lemb
        ";
        $join = "
            JOIN (
                SELECT
                    fil.id_sdm,
                    fil.nip,
                    fil.nm_sdm,
                    fil.id_sms,
                    fil.tridharma,
                    fil.praktisi,
                    fil.bimbing_prestasi,
                    (
                        SELECT
                            MAX(total_point)
                        FROM
                            (
                                VALUES
                                    (fil.tridharma),
                                    (fil.praktisi),
                                    (fil.bimbing_prestasi)
                            ) AS total(total_point)
                    ) AS total_point
                FROM
                    (
                        SELECT
                            sdm.id_sdm,
                            sdm.nip,
                            sdm.nidn,
                            sdm.nm_sdm,
                            fak.id_sms,
                            CASE
                                WHEN litabmas.total > 0
                                OR mengajar.total > 0
                                OR pembimbing.total > 0
                                OR menguji.total > 0 THEN 1
                                ELSE 0
                            END AS tridharma,
                            CASE
                                WHEN praktisi.total > 0 THEN 1
                                ELSE 0
                            END AS praktisi,
                            CASE
                                WHEN prestasi.total > 0 THEN 0.75
                                ELSE 0
                            END AS bimbing_prestasi
                        FROM
                            pdrd.sdm AS sdm WITH(NOLOCK)
                            JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                            AND ptk.id_sp = '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                            AND ptk.soft_delete = 0
                            AND ptk.id_jns_keluar IS NULL
                            AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                            JOIN pdrd.keaktifan_ptk AS aktf_ptk WITH(NOLOCK) ON aktf_ptk.id_reg_ptk = ptk.id_reg_ptk
                            AND aktf_ptk.soft_delete = 0
                            AND aktf_ptk.a_sp_homebase = 1
                            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                            AND prodi.soft_delete = 0
                            AND prodi.stat_prodi = 'A'
                            LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                            AND jenj.expired_date IS NULL
                            LEFT JOIN (
                                SELECT
                                    ang_lit.id_sdm,
                                    COUNT(lit.id_litabmas) AS total
                                FROM
                                    pdrd.litabmas AS lit WITH(NOLOCK)
                                    JOIN pdrd.sdm_anggota_litabmas AS ang_lit ON ang_lit.id_litabmas = lit.id_litabmas
                                    AND ang_lit.soft_delete = 0
                                WHERE
                                    lit.soft_delete = 0
                                    AND (
                                        lit.id_lemb_iptek != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                        OR lit.lokasi_kegiatan LIKE '%LK%'
                                    )
                                    AND lit.id_thn_kegiatan >= ($thn_iku - 5)
                                GROUP BY
                                    ang_lit.id_sdm
                            ) AS litabmas ON litabmas.id_sdm = sdm.id_sdm
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    COUNT(akt_ajar.id_reg_ptk) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.akt_ajar_dosen AS akt_ajar ON akt_ajar.id_reg_ptk = ptk.id_reg_ptk
                                    AND akt_ajar.soft_delete = 0
                                    JOIN pdrd.kelas_kuliah AS kls ON kls.id_kls = akt_ajar.id_kls
                                    AND kls.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = kls.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm
                            ) AS mengajar ON mengajar.id_sdm = sdm.id_sdm
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(bimbing_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.bimbing_mhs AS bimbing_mhs ON bimbing_mhs.id_sdm = ptk.id_sdm
                                    AND bimbing_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = bimbing_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.sms AS sms ON sms.id_sms = akt.id_sms
                                    AND sms.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND sms.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS pembimbing ON pembimbing.id_sdm = sdm.id_sdm
                            AND pembimbing.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(uji_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.uji_mhs AS uji_mhs ON uji_mhs.id_sdm = ptk.id_sdm
                                    AND uji_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = uji_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.sms AS sms ON sms.id_sms = akt.id_sms
                                    AND sms.id_sp != '".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                                    AND sms.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran >= ($thn_iku - 5)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS menguji ON menguji.id_sdm = sdm.id_sdm
                            AND menguji.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(ptk.id_sdm) AS total
                                FROM
                                    pdrd.rwy_pekerjaan AS rwy_kerja WITH(NOLOCK)
                                    JOIN (
                                        select
                                            p.id_sdm,
                                            max(p.waktu) as waktu,
                                            max(p.id_rwy_kerja) as id_rwy_kerja
                                        from
                                            (
                                                select
                                                    RANK() OVER (
                                                        PARTITION BY x.id_sdm
                                                        ORDER BY
                                                            x.waktu DESC,
                                                            x.last_update DESC
                                                    ) AS Rank,
                                                    x.id_sdm,
                                                    x.waktu,
                                                    x.id_rwy_kerja,
                                                    x.last_update
                                                from
                                                    (
                                                        select
                                                            case
                                                                when selesai_bekerja is null then DATEDIFF(day, mulai_bekerja, getdate()) / 365.2425
                                                                else DATEDIFF(day, mulai_bekerja, selesai_bekerja) / 365.2425
                                                            end as waktu,
                                                            *
                                                        from
                                                            pdrd.rwy_pekerjaan
                                                        where
                                                            soft_delete = 0
                                                    ) as x
                                            ) as p
                                        where
                                            p.Rank <= 1
                                            and p.waktu >= 0.5
                                        group by
                                            p.id_sdm
                                    ) AS rwy_waktu on rwy_waktu.id_rwy_kerja = rwy_kerja.id_rwy_kerja
                                    JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = rwy_waktu.id_sdm
                                    AND ptk.soft_delete = 0
                                    JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = ptk.id_sp
                                    AND sp.soft_delete = 0
                                    AND sp.stat_sp = 'A'
                                    JOIN pdrd.lembaga_non_sp AS lemb_non_sp ON lemb_non_sp.id_lemb_non_sp = sp.id_pembina
                                    AND lemb_non_sp.soft_delete = 0
                                WHERE
                                    rwy_kerja.soft_delete = 0
                                    AND rwy_waktu.waktu >= 0.5
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS praktisi ON praktisi.id_sdm = sdm.id_sdm
                            AND praktisi.id_reg_ptk = aktf_ptk.id_reg_ptk
                            LEFT JOIN (
                                SELECT
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk,
                                    COUNT(bimbing_mhs.id_sdm) AS total
                                FROM
                                    pdrd.reg_ptk AS ptk WITH(NOLOCK)
                                    JOIN pdrd.bimbing_mhs AS bimbing_mhs ON bimbing_mhs.id_sdm = ptk.id_sdm
                                    AND bimbing_mhs.soft_delete = 0
                                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = bimbing_mhs.id_akt_mhs
                                    AND akt.soft_delete = 0
                                    JOIN pdrd.prestasi AS prestasi ON prestasi.id_akt_mhs = akt.id_akt_mhs
                                    AND prestasi.soft_delete = 0
                                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                                    AND smt.expired_date IS NULL
                                WHERE
                                    smt.id_thn_ajaran = ($thn_iku - 1)
                                    AND ptk.soft_delete = 0
                                GROUP BY
                                    ptk.id_sdm,
                                    ptk.id_reg_ptk
                            ) AS prestasi ON prestasi.id_sdm = sdm.id_sdm
                            AND prestasi.id_reg_ptk = aktf_ptk.id_reg_ptk
                        WHERE
                            sdm.id_jns_sdm = 12
                            AND sdm.soft_delete = 0
                            AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                            AND LEFT(sdm.nidn, 2) < '88'
                            AND aktf_ptk.id_thn_ajaran = $thn_iku
                    ) AS fil
            ) AS iku ON iku.id_sms = lemb.id_sms
        ";
        $where = "
            WHERE
                lemb.soft_delete = 0
                AND lemb.id_jns_sms = 1
                AND lemb.id_sms NOT IN (
                    '61752f1d-2cd6-4186-a2da-8189e2c3bc0c'
                )
        ";
        $group_by = "
            GROUP BY
                lemb.id_sms,
                lemb.id_jns_sms,
                lemb.nm_lemb
        ";
      }
      $result = DB::select($select . $join . $where . $group_by);
      $last_sync = collect(
        DB::select('SELECT last_sync AS time FROM pdrd.keaktifan_ptk WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = array();
      $total_point = 0;
      $point_tridharma = 0;
      $point_praktisi = 0;
      $point_bimbing_prestasi = 0;
      $total_dosen = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'SISTER UNILA - SISTER PDDIKTI';

      foreach ($result as $index => $each_data) {
        $total_point += $each_data->total_point;
        $point_tridharma += $each_data->point_tridharma;
        $point_praktisi += $each_data->point_praktisi;
        $point_bimbing_prestasi += $each_data->point_bimbing_prestasi;
        $total_tpb = $point_tridharma + $point_praktisi + $point_bimbing_prestasi;
        $total_dosen += $each_data->total_dosen;
        $pembentuk = '( '.$total_point . ' / ' . $total_dosen .' ) * 100';

        if ($total_dosen != 0) {
          $pencapaian = ($total_point / $total_dosen) * 100;
        } else {
          $pencapaian = 0;
        }
        $gold_standart = 20;

        $sub = $gold_standart - $pencapaian;
        if($pencapaian > $gold_standart){
          $delta_gold_standart = abs($sub);
        }else{
          $delta_gold_standart = $sub;
        }
        $skor_pencapaian = $pencapaian / $gold_standart;

        $iku['count'] = [
            'total_point' => number_format($total_point, 2),
            'point_tridharma' => $point_tridharma,
            'point_praktisi' => $point_praktisi,
            'point_bimbing_prestasi' => $point_bimbing_prestasi,
            'total_tpb' => $total_tpb,
            'total_dosen' => $total_dosen,
            'pembentuk' => $pembentuk,
            'pencapaian' => number_format($pencapaian, 2) . '%',
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
            'point_tridharma' => $each_data->point_tridharma,
            'point_praktisi' => $each_data->point_praktisi,
            'point_bimbing_prestasi' => $each_data->point_bimbing_prestasi,
            'total_point' => $each_data->total_point,
            'total_dosen' => $each_data->total_dosen,
            'capaian' => $each_data->capaian,
        ];
      }

      return response()->json($iku);
    // } else {
    //   $result = [];
    //   return response()->json($result);
    // }
  }

  public function listRawData()
  {
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;

    if ($thn_iku == $thn_iku) {
      if (!is_null($id_sms)) {
        $where = "

        ";
      } else {
        $where = "

        ";
      }
      $select = "

      ";
      $join = "

      ";
      $order_by = " ";
      $result = DB::select($select . $join . $where . $order_by);

      return response()->json($result);


    } else {
      $result = [];
      return response()->json($result);
    }
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
