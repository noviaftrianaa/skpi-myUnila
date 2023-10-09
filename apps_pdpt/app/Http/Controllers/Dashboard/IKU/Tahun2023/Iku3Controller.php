<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku3Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku1Controller::class)->tahunIku();
    }

    public function homeIku3()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.iku3', compact('side_active', 'thn_iku'));
    }

    public function apiIku3()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku3 = DB::select("
            SELECT
                (
                    SELECT
                        COUNT(tal.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                        AND tal.soft_delete = 0
                        JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                        AND tl.soft_delete = 0
                        AND (
                            tl.id_lemb_iptek != tsp.id_sp
                            OR tl.lokasi_kegiatan LIKE '%LK%'
                        )
                        LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                        LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                        AND pub.soft_delete = 0
                        LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
                    WHERE
                        tl.id_thn_kegiatan >= '" . ($thn_iku - 5) . "'
                        AND tal.id_sdm = sdm.id_sdm
                ) AS l_tridharma_litabmas,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.reg_ptk AS tr2 ON tr2.id_sdm = tsdm.id_sdm
                        AND tr2.id_sp != tr.id_sp
                        JOIN pdrd.akt_ajar_dosen AS takt ON takt.id_reg_ptk = tr2.id_reg_ptk
                        AND takt.soft_delete = 0
                        JOIN pdrd.kelas_kuliah AS kls ON kls.id_kls = takt.id_kls
                        AND kls.soft_delete = 0
                        AND kls.id_smt >= 20191
                        JOIN pdrd.matkul AS mk ON mk.id_mk = kls.id_mk
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = kls.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = kls.id_smt
                    WHERE
                        takt.id_ajar IS NOT NULL
                        AND tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_ngajar,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.bimbing_mhs AS tb ON tb.id_sdm = tsdm.id_sdm
                        AND tb.soft_delete = 0
                        JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = tb.id_akt_mhs
                        AND akt.soft_delete = 0
                        AND akt.id_smt >= 20191
                        JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs
                        JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tb.id_katgiat
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = akt.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        AND tspl.id_sp != tsp.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = akt.id_smt
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_bimbing,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = 202
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.uji_mhs AS tu ON tu.id_sdm = tsdm.id_sdm
                        AND tu.soft_delete = 0
                        JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = tu.id_akt_mhs
                        AND akt.soft_delete = 0
                        AND akt.id_smt >= 20191
                        JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs
                        JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tu.id_katgiat
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = akt.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        AND tspl.id_sp != tsp.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = akt.id_smt
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_menguji,
                (
                    select
                        COUNT(r.id_sdm)
                    from
                        (
                            select
                                w.id_sdm,
                                b.nidn,
                                b.nm_sdm as nama,
                                (
                                    select
                                        nm_ikatan_kerja
                                    from
                                        ref.ikatan_kerja_sdm o
                                    where
                                        o.id_ikatan_kerja = c.id_ikatan_kerja
                                ) as ikatan_kerja,
                                --tjabfung.id_jabfung,
                                b.tgl_lahir,
                                floor(datediff(day, b.tgl_lahir, getdate()) / 365.2425) as usia,
                                b.jk,
                                concat(tsms.nm_lemb, ' (', tj.nm_jenj_didik, ')') AS prodi,
                                e.nm_lemb as asal_pt,
                                e.npsn as kode_pt,
                                f.nm_lemb as pembina,
                                w.nm_jabatan,
                                w.instansi,
                                w.divisi,
                                case
                                    when w.a_ln = 1 then 'LN'
                                    else 'DN'
                                end as LN_DN,
                                (
                                    select
                                        z.nm_pekerjaan
                                    from
                                        ref.pekerjaan z
                                    where
                                        z.id_pekerjaan = w.id_pekerjaan
                                ) as pekerjaan,
                                (
                                    select
                                        z.judul
                                    from
                                        ref.kbli z
                                    where
                                        z.id_kbli = w.id_kbli
                                ) as bidang,
                                w.mulai_bekerja,
                                case
                                    when (
                                        w.selesai_bekerja is null
                                        or w.selesai_bekerja > getdate()
                                    ) then CAST(getdate() AS date)
                                    else w.selesai_bekerja
                                end as selesai_bekerja,
                                q.waktu,
                                w.last_update
                            from
                                pdrd.rwy_pekerjaan w
                                join (
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
                                ) q on q.id_rwy_kerja = w.id_rwy_kerja
                                join pdrd.sdm b on b.id_sdm = q.id_sdm
                                join pdrd.reg_ptk c on b.id_sdm = c.id_sdm
                                join pdrd.keaktifan_ptk d on c.id_reg_ptk = d.id_reg_ptk
                                JOIN pdrd.sms tsms ON tsms.id_sms = c.id_sms
                                AND tsms.soft_delete = 0
                                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                                join pdrd.satuan_pendidikan e on c.id_sp = e.id_sp
                                join pdrd.lembaga_non_sp f on e.id_pembina = f.id_lemb_non_sp
                            where
                                w.soft_delete = 0
                                and b.soft_delete = 0
                                and c.soft_delete = 0
                                and d.soft_delete = 0
                                and e.soft_delete = 0
                                and b.id_jns_sdm = 12
                                and c.id_jns_keluar is null
                                and d.id_thn_ajaran = '" . $thn_iku . "'
                                and d.a_sp_homebase = 1
                                AND e.stat_sp = 'A'
                                AND tsms.id_jns_sms = 3
                                AND LEFT(e.id_wil, 2) <> '99'
                                AND b.id_stat_aktif IN (1, 20, 24, 25, 27)
                                and q.waktu >= 0.5
                                AND LEFT(b.nidn, 2) < '88'
                                AND e.npsn = '001026'
                        ) as r
                    where
                        r.selesai_bekerja > '" . $thn_iku . "'
                        AND r.id_sdm = sdm.id_sdm
                ) AS l_praktisi,
                (
                    SELECT
                        COUNT(tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.bimbing_mhs AS bm ON bm.id_sdm = tsdm.id_sdm
                        AND bm.soft_delete = 0
                        JOIN pdrd.akt_mhs AS takt ON takt.id_akt_mhs = bm.id_akt_mhs
                        JOIN pdrd.prestasi AS p ON p.id_akt_mhs = takt.id_akt_mhs
                        AND p.soft_delete = 0
                        AND p.thn_prestasi >= '" . ($thn_iku - 1) . "'
                        JOIN ref.jenis_prestasi AS jp ON jp.id_jenis_prestasi = p.id_jenis_prestasi
                        JOIN ref.tingkat_prestasi AS tkt ON tkt.id_tkt_prestasi = p.id_tkt_prestasi
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_prestasi,
                sdm.id_sdm,
                prod.id_sms AS y_id_prodi,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.id_sms AS y_id_fakultas,
                fak.nm_lemb AS y_nm_fakultas
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . $thn_iku . "'
            WHERE
                sdm.id_jns_sdm = 12
                AND sdm.soft_delete = 0
                AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                AND LEFT(sdm.nidn, 2) < '88'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prod.nm_lemb ASC
            ");
        $fakultas = [];
        foreach ($apiIku3 as $k => $v) {
            $x_yes = ($v->l_tridharma_litabmas > 0 || $v->l_tridharma_ngajar > 0 || $v->l_tridharma_bimbing > 0 || $v->l_tridharma_menguji > 0 || $v->l_praktisi > 0 || $v->l_prestasi > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_tridharma_litabmas' => (int) $v->l_tridharma_litabmas,
                    'l_tridharma_ngajar' => (int) $v->l_tridharma_ngajar,
                    'l_tridharma_bimbing' => (int) $v->l_tridharma_bimbing,
                    'l_tridharma_menguji' => (int) $v->l_tridharma_menguji,
                    'l_praktisi' => (int) $v->l_praktisi,
                    'l_prestasi' => (int) $v->l_prestasi,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_litabmas'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_litabmas'] + (int) $v->l_tridharma_litabmas;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_ngajar'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_ngajar'] + (int) $v->l_tridharma_ngajar;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_bimbing'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_bimbing'] + (int) $v->l_tridharma_bimbing;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_menguji'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma_menguji'] + (int) $v->l_tridharma_menguji;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] + (int) $v->l_praktisi;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_prestasi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_prestasi'] + (int) $v->l_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku3 as $k => $v) {
            $x_yes = ($v->l_tridharma_litabmas > 0 || $v->l_tridharma_ngajar > 0 || $v->l_tridharma_bimbing > 0 || $v->l_tridharma_menguji > 0 || $v->l_praktisi > 0 || $v->l_prestasi > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_tridharma_litabmas' => (int) $v->l_tridharma_litabmas,
                    'l_tridharma_ngajar' => (int) $v->l_tridharma_ngajar,
                    'l_tridharma_bimbing' => (int) $v->l_tridharma_bimbing,
                    'l_tridharma_menguji' => (int) $v->l_tridharma_menguji,
                    'l_praktisi' => (int) $v->l_praktisi,
                    'l_prestasi' => (int) $v->l_prestasi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_litabmas'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_litabmas'] + (int) $v->l_tridharma_litabmas;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_ngajar'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_ngajar'] + (int) $v->l_tridharma_ngajar;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_bimbing'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_bimbing'] + (int) $v->l_tridharma_bimbing;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_menguji'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma_menguji'] + (int) $v->l_tridharma_menguji;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] + (int) $v->l_praktisi;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_prestasi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_prestasi'] + (int) $v->l_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku3Dosen()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku3Dosen = DB::select("
                SELECT
                (
                    SELECT
                        COUNT(tal.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                        AND tal.soft_delete = 0
                        JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                        AND tl.soft_delete = 0
                        AND (
                            tl.id_lemb_iptek != tsp.id_sp
                            OR tl.lokasi_kegiatan LIKE '%LK%'
                        )
                        LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                        LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                        AND pub.soft_delete = 0
                        LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
                    WHERE
                        tl.id_thn_kegiatan >= '" . ($thn_iku - 5) . "'
                        AND tal.id_sdm = sdm.id_sdm
                ) AS l_tridharma_litabmas,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.reg_ptk AS tr2 ON tr2.id_sdm = tsdm.id_sdm
                        AND tr2.id_sp != tr.id_sp
                        JOIN pdrd.akt_ajar_dosen AS takt ON takt.id_reg_ptk = tr2.id_reg_ptk
                        AND takt.soft_delete = 0
                        JOIN pdrd.kelas_kuliah AS kls ON kls.id_kls = takt.id_kls
                        AND kls.soft_delete = 0
                        AND kls.id_smt >= 20191
                        JOIN pdrd.matkul AS mk ON mk.id_mk = kls.id_mk
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = kls.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = kls.id_smt
                    WHERE
                        takt.id_ajar IS NOT NULL
                        AND tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_ngajar,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.bimbing_mhs AS tb ON tb.id_sdm = tsdm.id_sdm
                        AND tb.soft_delete = 0
                        JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = tb.id_akt_mhs
                        AND akt.soft_delete = 0
                        AND akt.id_smt >= 20191
                        JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs
                        JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tb.id_katgiat
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = akt.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        AND tspl.id_sp != tsp.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = akt.id_smt
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_bimbing,
                (
                    SELECT
                        COUNT (tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = 202
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.uji_mhs AS tu ON tu.id_sdm = tsdm.id_sdm
                        AND tu.soft_delete = 0
                        JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = tu.id_akt_mhs
                        AND akt.soft_delete = 0
                        AND akt.id_smt >= 20191
                        JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs
                        JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tu.id_katgiat
                        JOIN pdrd.sms AS tsmsl ON tsmsl.id_sms = akt.id_sms
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsmsl.id_jenj_didik
                        JOIN pdrd.satuan_pendidikan AS tspl ON tspl.id_sp = tsmsl.id_sp
                        AND tspl.id_sp != tsp.id_sp
                        JOIN ref.semester AS tsmt ON tsmt.id_smt = akt.id_smt
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_tridharma_menguji,
                (
                    select
                        COUNT(r.id_sdm)
                    from
                        (
                            select
                                w.id_sdm,
                                b.nidn,
                                b.nm_sdm as nama,
                                (
                                    select
                                        nm_ikatan_kerja
                                    from
                                        ref.ikatan_kerja_sdm o
                                    where
                                        o.id_ikatan_kerja = c.id_ikatan_kerja
                                ) as ikatan_kerja,
                                --tjabfung.id_jabfung,
                                b.tgl_lahir,
                                floor(datediff(day, b.tgl_lahir, getdate()) / 365.2425) as usia,
                                b.jk,
                                concat(tsms.nm_lemb, ' (', tj.nm_jenj_didik, ')') AS prodi,
                                e.nm_lemb as asal_pt,
                                e.npsn as kode_pt,
                                f.nm_lemb as pembina,
                                w.nm_jabatan,
                                w.instansi,
                                w.divisi,
                                case
                                    when w.a_ln = 1 then 'LN'
                                    else 'DN'
                                end as LN_DN,
                                (
                                    select
                                        z.nm_pekerjaan
                                    from
                                        ref.pekerjaan z
                                    where
                                        z.id_pekerjaan = w.id_pekerjaan
                                ) as pekerjaan,
                                (
                                    select
                                        z.judul
                                    from
                                        ref.kbli z
                                    where
                                        z.id_kbli = w.id_kbli
                                ) as bidang,
                                w.mulai_bekerja,
                                case
                                    when (
                                        w.selesai_bekerja is null
                                        or w.selesai_bekerja > getdate()
                                    ) then CAST(getdate() AS date)
                                    else w.selesai_bekerja
                                end as selesai_bekerja,
                                q.waktu,
                                w.last_update
                            from
                                pdrd.rwy_pekerjaan w
                                join (
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
                                ) q on q.id_rwy_kerja = w.id_rwy_kerja
                                join pdrd.sdm b on b.id_sdm = q.id_sdm
                                join pdrd.reg_ptk c on b.id_sdm = c.id_sdm
                                join pdrd.keaktifan_ptk d on c.id_reg_ptk = d.id_reg_ptk
                                JOIN pdrd.sms tsms ON tsms.id_sms = c.id_sms
                                AND tsms.soft_delete = 0
                                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                                join pdrd.satuan_pendidikan e on c.id_sp = e.id_sp
                                join pdrd.lembaga_non_sp f on e.id_pembina = f.id_lemb_non_sp
                            where
                                w.soft_delete = 0
                                and b.soft_delete = 0
                                and c.soft_delete = 0
                                and d.soft_delete = 0
                                and e.soft_delete = 0
                                and b.id_jns_sdm = 12
                                and c.id_jns_keluar is null
                                and d.id_thn_ajaran = '" . $thn_iku . "'
                                and d.a_sp_homebase = 1
                                AND e.stat_sp = 'A'
                                AND tsms.id_jns_sms = 3
                                AND LEFT(e.id_wil, 2) <> '99'
                                AND b.id_stat_aktif IN (1, 20, 24, 25, 27)
                                and q.waktu >= 0.5
                                AND LEFT(b.nidn, 2) < '88'
                                AND e.npsn = '001026'
                        ) as r
                    where
                        r.selesai_bekerja > '" . $thn_iku . "'
                        AND r.id_sdm = sdm.id_sdm
                ) AS l_praktisi,
                (
                    SELECT
                        COUNT(tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        JOIN pdrd.bimbing_mhs AS bm ON bm.id_sdm = tsdm.id_sdm
                        AND bm.soft_delete = 0
                        JOIN pdrd.akt_mhs AS takt ON takt.id_akt_mhs = bm.id_akt_mhs
                        JOIN pdrd.prestasi AS p ON p.id_akt_mhs = takt.id_akt_mhs
                        AND p.soft_delete = 0
                        AND p.thn_prestasi >= '" . ($thn_iku - 1) . "'
                        JOIN ref.jenis_prestasi AS jp ON jp.id_jenis_prestasi = p.id_jenis_prestasi
                        JOIN ref.tingkat_prestasi AS tkt ON tkt.id_tkt_prestasi = p.id_tkt_prestasi
                    WHERE
                        tsdm.id_sdm = sdm.id_sdm
                ) AS l_prestasi,
                sdm.nidn AS l_nidn,
                sdm.nm_sdm,
                sdm.jk,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.nm_lemb AS y_nm_fakultas,
                aktf.nm_stat_aktif AS keaktifan,
                skep.nm_stat_pegawai AS stat_pegawai,
                iks.nm_ikatan_kerja AS ikatan_kerja,
                (
                    SELECT
                        TOP 1 jenjpend.nm_jenj_didik
                    FROM
                        pdrd.rwy_pend_formal AS pend
                        JOIN ref.jenjang_pendidikan AS jenjpend ON jenjpend.id_jenj_didik = pend.id_jenj_didik
                        AND jenjpend.expired_date IS NULL
                        JOIN ref.bidang_studi AS bids ON bids.id_bid_studi = pend.id_bid_studi
                    WHERE
                        pend.id_sdm = sdm.id_sdm
                        AND pend.soft_delete = 0
                    ORDER BY
                        pend.thn_lulus DESC
                ) AS pend_akhir,
                sdm.id_sdm,
                prod.id_sms AS y_id_prodi,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.id_sms AS y_id_fakultas,
                fak.nm_lemb AS y_nm_fakultas
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . $thn_iku . "'
                JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                AND skep.expired_date IS NULL
                JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                AND aktf.expired_date IS NULL
                JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                AND iks.expired_date IS NULL
            WHERE
                sdm.id_jns_sdm = 12
                AND sdm.soft_delete = 0
                AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                AND LEFT(sdm.nidn, 2) < '88'
                AND ptk.id_sms = '" . $id_prodi . "'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prod.nm_lemb ASC
        ");
        return DaTables::of($apiIku3Dosen)->make(true);
}

    public function apiIku3TridharmaLitabmas()
    {
        $thn_iku = $this->request->thn_iku;
        $id_sdm = $this->request->id_sdm;
        $apiIku3Tridharma = DB::select("
            SELECT
                tl.id_thn_kegiatan AS TA,
                tsdm.nidn AS NIDN,
                tsdm.nm_sdm AS 'Nama Dosen',
                tsp.nm_lemb AS 'Nama PT',
                tsms.nm_lemb AS 'Nama Prodi',
                tl.judul_litabmas,
                tl.id_kel_bidang,
                CASE
                    WHEN tl.jns_litabmas = 'M' THEN 'Pengabdian Masyarakat'
                    ELSE 'Penelitian'
                END AS 'Jenis Litabmas',
                kb.nm_kel_bidang AS 'Bidang',
                pub.judul AS 'Judul Publikasi',
                pub.tgl_terbit AS 'Tanggal Terbit',
                jns_pub.nm_jns_pub AS 'Jenis Publikasi'
            FROM
                pdrd.sdm AS tsdm
                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                AND tr.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                AND ta.a_sp_homebase = 1
                AND ta.id_thn_ajaran = '" . $thn_iku . "'
                JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                AND tsp.npsn = '001026'
                JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                AND tal.soft_delete = 0
                JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                AND tl.soft_delete = 0
                AND (
                    tl.id_lemb_iptek != tsp.id_sp
                    OR tl.lokasi_kegiatan LIKE '%LK%'
                )
                LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
            WHERE
                tl.id_thn_kegiatan >= '" . ($thn_iku - 5) . "'
                AND LEFT(tsdm.nidn, 2) < '88'
                AND tsdm.id_sdm = '" . $id_sdm . "'
            ");
        return DaTables::of($apiIku3Tridharma)->make(true);
    }

    public function apiIku3Praktisi()
    {
        $id_sdm = $this->request->id_sdm;
        $thn_iku = $this->request->thn_iku;
        $apiIku3Praktisi = DB::select("
            select
                *
            from
                (
                    select
                        w.id_sdm,
                        b.nidn,
                        b.nm_sdm as nama,
                        (
                            select
                                nm_ikatan_kerja
                            from
                                ref.ikatan_kerja_sdm o
                            where
                                o.id_ikatan_kerja = c.id_ikatan_kerja
                        ) as ikatan_kerja,
                        --tjabfung.id_jabfung,
                        b.tgl_lahir,
                        floor(datediff(day, b.tgl_lahir, getdate()) / 365.2425) as usia,
                        b.jk,
                        concat(tsms.nm_lemb, ' (', tj.nm_jenj_didik, ')') AS prodi,
                        e.nm_lemb as asal_pt,
                        e.npsn as kode_pt,
                        f.nm_lemb as pembina,
                        w.nm_jabatan,
                        w.instansi,
                        w.divisi,
                        case
                            when w.a_ln = 1 then 'LN'
                            else 'DN'
                        end as LN_DN,
                        (
                            select
                                z.nm_pekerjaan
                            from
                                ref.pekerjaan z
                            where
                                z.id_pekerjaan = w.id_pekerjaan
                        ) as pekerjaan,
                        (
                            select
                                z.judul
                            from
                                ref.kbli z
                            where
                                z.id_kbli = w.id_kbli
                        ) as bidang,
                        w.mulai_bekerja,
                        case
                            when (
                                w.selesai_bekerja is null
                                or w.selesai_bekerja > getdate()
                            ) then CAST(getdate() AS date)
                            else w.selesai_bekerja
                        end as selesai_bekerja,
                        q.waktu,
                        w.last_update
                    from
                        pdrd.rwy_pekerjaan w
                        join (
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
                        ) q on q.id_rwy_kerja = w.id_rwy_kerja
                        join pdrd.sdm b on b.id_sdm = q.id_sdm
                        join pdrd.reg_ptk c on b.id_sdm = c.id_sdm
                        join pdrd.keaktifan_ptk d on c.id_reg_ptk = d.id_reg_ptk
                        JOIN pdrd.sms tsms ON tsms.id_sms = c.id_sms
                        AND tsms.soft_delete = 0
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                        join pdrd.satuan_pendidikan e on c.id_sp = e.id_sp
                        join pdrd.lembaga_non_sp f on e.id_pembina = f.id_lemb_non_sp
                    where
                        w.soft_delete = 0
                        and b.soft_delete = 0
                        and c.soft_delete = 0
                        and d.soft_delete = 0
                        and e.soft_delete = 0
                        and b.id_jns_sdm = 12
                        and c.id_jns_keluar is null
                        and d.id_thn_ajaran = '" . $thn_iku . "'
                        and d.a_sp_homebase = 1
                        AND e.stat_sp = 'A'
                        AND tsms.id_jns_sms = 3
                        AND LEFT(e.id_wil, 2) <> '99'
                        AND b.id_stat_aktif IN (1, 20, 24, 25, 27)
                        and q.waktu >= 0.5
                        AND LEFT(b.nidn, 2) < '88'
                        AND e.npsn = '001026'
                ) as r
            where
                r.selesai_bekerja > '" . $thn_iku . "'
                AND r.id_sdm = ?
            ORDER BY
                r.last_update DESC
            ", [$id_sdm]);
        return DaTables::of($apiIku3Praktisi)->make(true);
    }

    public function apiIku3Qs100()
    {
        $id_sdm = $this->request->id_sdm;
        $thn_iku = $this->request->thn_iku;
        $apiIku3Qs100 = DB::select("
            SELECT
                dts.bid_tgs,
                spsb.nm_lemb AS sp_sumber,
                spss.nm_lemb AS sp_sasaran,
                dts.tgl_mulai,
                dts.tgl_selesai
            FROM
                pdrd.detasering AS dts WITH(NOLOCK)
                JOIN pdrd.satuan_pendidikan AS spsb WITH(NOLOCK) ON spsb.id_sp = dts.id_sp_sumber
                AND spsb.soft_delete = 0
                JOIN pdrd.satuan_pendidikan AS spss WITH(NOLOCK) ON spss.id_sp = dts.id_sp_sumber
                AND spss.soft_delete = 0
            WHERE
                dts.id_sdm = '". $id_sdm ."'
                AND dts.soft_delete = 0
                AND YEAR(dts.tgl_selesai) = '". $thn_iku ."'
        ");
        return DaTables::of($apiIku3Qs100)->make(true);
    }

    public function apiIku3Prestasi()
    {
        $id_sdm = $this->request->id_sdm;
        $thn_iku = $this->request->thn_iku;
        $apiIku3Prestasi =  DB::select("
                SELECT
                    psd.nm_pd,
                    rpd.nipd,
                    psd.jk,
                    psd.tgl_lahir,
                    prodi.nm_lemb AS nm_prodi,
                    jur.nm_lemb AS nm_jur,
                    fak.nm_lemb AS nm_fak,
                    jpres.nm_jenis_prestasi,
                    pres.nm_prestasi,
                    pres.penyelenggara,
                    pres.peringkat,
                    pres.thn_prestasi
                FROM
                    pdrd.bimbing_mhs AS bmhs
                    JOIN pdrd.prestasi AS pres ON pres.id_akt_mhs = bmhs.id_akt_mhs
                    AND pres.soft_delete = 0
                    AND pres.id_tkt_prestasi IN (5, 6)
                    JOIN ref.jenis_prestasi AS jpres ON jpres.id_jenis_prestasi = pres.id_jenis_prestasi
                    AND jpres.expired_date IS NULL
                    JOIN pdrd.peserta_didik AS psd ON psd.id_pd = pres.id_pd
                    AND psd.soft_delete = 0
                    JOIN pdrd.reg_pd AS rpd ON rpd.id_pd = psd.id_pd
                    AND rpd.soft_delete = 0
                    JOIN pdrd.sms AS prodi ON prodi.id_sms = rpd.id_sms
                    AND prodi.soft_delete = 0
                    LEFT JOIN pdrd.sms AS jur ON jur.id_sms = prodi.id_jur_unila
                    AND jur.soft_delete =  0
                    JOIN pdrd.sms AS fak ON fak.id_sms = prodi.id_fak_unila
                    AND fak.soft_delete = 0
                WHERE
                    bmhs.id_sdm = ?
                    AND bmhs.soft_delete = 0
                    AND pres.thn_prestasi = " . $thn_iku . "
            ", [$id_sdm]);
        return DaTables::of($apiIku3Prestasi)->make(true);
    }
}
