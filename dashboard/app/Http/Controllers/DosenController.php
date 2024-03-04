<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DosenController extends Controller
{
    public function __construct()
    {
        $this->basepath = "dosen";
    }

    public function index($id)
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $id = \Crypt::decrypt($id);

        $profil = DB::SELECT(
            "
      SELECT
        sdm.*,
        sms.nm_lemb,
        jur.nm_lemb AS jur,
        fak.nm_lemb AS fak,
        stat.nm_stat_aktif,
        jenjang.nm_jenj_didik
      FROM
        pdrd.sdm AS sdm
        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm=sdm.id_sdm AND ptk.soft_delete=0
        JOIN pdrd.sms AS sms ON sms.id_sms=ptk.id_sms AND sms.soft_delete=0
        JOIN ref.status_keaktifan_pegawai AS stat ON stat.id_stat_aktif=sdm.id_stat_aktif AND stat.expired_date IS NULL
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
        LEFT JOIN pdrd.sms AS jur ON jur.id_sms=sms.id_jur_unila AND jur.soft_delete=0
        LEFT JOIN pdrd.sms AS fak ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
      WHERE
        sdm.soft_delete=0
        AND sdm.id_sdm='" .
                $id .
                "'
    "
        )[0];
        $profil->gelar =
            DB::SELECT(
                "
      SELECT DISTINCT
        gel.singkat_gelar,
        gel.posisi_gelar,
        pen.thn_lulus
      FROM
        pdrd.rwy_pend_formal AS pen
        JOIN ref.gelar_akademik AS gel ON gel.id_gelar_akad=pen.id_gelar_akad AND gel.expired_date IS NULL
      WHERE
        pen.soft_delete=0
        AND pen.id_sdm='" .
                    $id .
                    "'
        AND pen.thn_lulus IS NOT NULL
      ORDER BY
        pen.thn_lulus ASC,
        gel.posisi_gelar ASC
    "
            ) ?? [];

        $kepangkatan = $this->kepangkatan($id);

        $jabfung = $this->jabfung($id);

        $pendidikan = $this->pendidikan($id);

        $sertifikasi = $this->sertifikasi($id);

        $penelitian = $this->penelitian($id);

        $publikasi = $this->publikasi($id);

        $pengabdian = $this->pengabdian($id);

        $haki = $this->haki($id);

        return view("content.pages.dosen.detail", [
            "pageConfigs" => $pageConfigs,
            "profil" => $profil,
            "pendidikan" => $pendidikan,
            "sertifikasi" => $sertifikasi,
            "penelitian" => $penelitian,
            "publikasi" => $publikasi,
            "pengabdian" => $pengabdian,
            "haki" => $haki,
            "kepangkatan" => $kepangkatan,
            "jabfung" => $jabfung,
        ]);
    }

    private function kepangkatan($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT
                pangkat.sk_pangkat,
                pangkat.tgl_sk_pangkat,
                pangkat.tmt_sk_pangkat,
                pangkat.masa_kerja_gol_thn,
                pangkat.masa_kerja_gol_bln,
                gol.nm_pangkat,
                gol.kode_gol
            FROM
                pdrd.rwy_kepangkatan AS pangkat
                JOIN ref.pangkat_golongan AS gol ON gol.id_pangkat_gol=pangkat.id_pangkat_gol AND gol.expired_date IS NULL
            WHERE
                pangkat.soft_delete=0
                AND pangkat.id_sdm='" .
                    $id .
                    "'
            ORDER BY
                pangkat.tgl_sk_pangkat DESC
    "
            ) ?? [];

        return $data;
    }

    private function jabfung($id)
    {
        $data =
            DB::SELECT(
                "
        SELECT
            rwy.sk_jabfung,
            rwy.angka_kredit,
            rwy.tmt_sk_jabfung,
            jabfung.nm_jabfung
        FROM
            pdrd.rwy_fungsional AS rwy
            JOIN ref.jabfung AS jabfung ON jabfung.id_jabfung=rwy.id_jabfung AND jabfung.expired_date IS NULL
        WHERE
            rwy.soft_delete=0
            AND rwy.id_sdm='" .
                    $id .
                    "'
        ORDER BY
            rwy.tmt_sk_jabfung DESC
        "
            ) ?? [];

        return $data;
    }

    private function pendidikan($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT DISTINCT
                pendidikan.nm_sp_formal,
                pendidikan.thn_lulus,
                pendidikan.judul_tesis,
                jenjang.nm_jenj_didik,
                bidang.nm_bid_studi,
                gelar.singkat_gelar,
                gelar.nm_gelar_akad
            FROM
                pdrd.rwy_pend_formal AS pendidikan
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=pendidikan.id_jenj_didik AND jenjang.expired_date IS NULL
                JOIN ref.bidang_studi AS bidang ON bidang.id_bid_studi=pendidikan.id_bid_studi AND bidang.expired_date IS NULL
                JOIN ref.gelar_akademik AS gelar ON gelar.id_gelar_akad=pendidikan.id_gelar_akad AND gelar.expired_date IS NULL
            WHERE
                pendidikan.soft_delete=0
                AND pendidikan.id_sdm = '" .
                    $id .
                    "'
                AND pendidikan.thn_lulus IS NOT NULL
            ORDER BY
                pendidikan.thn_lulus DESC
        "
            ) ?? [];

        return $data;
    }

    private function sertifikasi($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT DISTINCT
                sertifikasi.*,
                jenis.nm_jns_sert,
                bidang.nm_bid_studi
            FROM
                pdrd.rwy_sertifikasi AS sertifikasi
                JOIN ref.jenis_sert AS jenis ON jenis.id_jns_sert=sertifikasi.id_jns_sert AND jenis.expired_date IS NULL
                JOIN ref.bidang_studi AS bidang ON bidang.id_bid_studi=sertifikasi.id_bid_studi AND bidang.expired_date IS NULL
            WHERE
                sertifikasi.soft_delete=0
                AND sertifikasi.id_sdm = '" .
                    $id .
                    "'
                AND sertifikasi.thn_sert IS NOT NULL
            ORDER BY
                sertifikasi.thn_sert DESC
        "
            ) ?? [];

        return $data;
    }

    private function penelitian($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT
                pen.judul_litabmas,
                pen.id_thn_laks,
                (
                SELECT
                    STRING_AGG(sdm.nm_sdm, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS anggota,
                (
                SELECT
                    STRING_AGG(anggota.peran_litabmas, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS peran
            FROM
                pdrd.litabmas AS pen
                JOIN pdrd.sdm_anggota_litabmas AS ang ON ang.id_litabmas=pen.id_litabmas AND ang.soft_delete=0 AND ang.stat_aktif=1
            WHERE
                pen.soft_delete=0
                AND pen.jns_litabmas='L'
                AND ang.id_sdm='" .
                    $id .
                    "'
            ORDER BY
                pen.id_thn_laks DESC
        "
            ) ?? [];

        return $data;
    }

    private function publikasi($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT
                pen.judul_litabmas,
                pen.id_thn_laks,
                (
                SELECT
                    STRING_AGG(sdm.nm_sdm, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS anggota,
                (
                SELECT
                    STRING_AGG(anggota.peran_litabmas, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS peran
            FROM
                pdrd.litabmas AS pen
                JOIN pdrd.sdm_anggota_litabmas AS ang ON ang.id_litabmas=pen.id_litabmas AND ang.soft_delete=0 AND ang.stat_aktif=1
            WHERE
                pen.soft_delete=0
                AND pen.jns_litabmas='M'
                AND ang.id_sdm='" .
                    $id .
                    "'
                AND ang.id_katgiat IN (
                120101, 120102, 120103,
                    120104, 120105, 120106,
                    120107, 120108, 120109,
                    120110, 120111, 120112,
                    120901, 120902, 120903,
                    120904, 120905, 120906,
                    120907, 120908, 120909,
                    120910, 120911, 120113,
                    120114, 120115, 120116,
                    120117, 120118, 120119,
                    120120, 120121, 120122,
                    120200, 120300, 121300,
                    130500, 130600
                )
            ORDER BY
                pen.id_thn_laks DESC
        "
            ) ?? [];

        return $data;
    }

    private function pengabdian($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT
                pen.judul_litabmas,
                pen.id_thn_laks,
                (
                SELECT
                    STRING_AGG(sdm.nm_sdm, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS anggota,
                (
                SELECT
                    STRING_AGG(anggota.peran_litabmas, ',')
                FROM
                    pdrd.sdm_anggota_litabmas AS anggota
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                    anggota.soft_delete=0
                    AND anggota.id_litabmas=pen.id_litabmas
                ) AS peran
            FROM
                pdrd.litabmas AS pen
                JOIN pdrd.sdm_anggota_litabmas AS ang ON ang.id_litabmas=pen.id_litabmas AND ang.soft_delete=0 AND ang.stat_aktif=1
            WHERE
                pen.soft_delete=0
                AND pen.jns_litabmas='M'
                AND ang.id_sdm='" .
                    $id .
                    "'
                AND ang.id_katgiat IN (
                '130201',
                '130202',
                '130203',
                '130204',
                '130401',
                '130402',
                '130403'
                )
            ORDER BY
                pen.id_thn_laks DESC
        "
            ) ?? [];

        return $data;
    }

    private function haki($id)
    {
        $data =
            DB::SELECT(
                "
            SELECT
                pub.judul,
                pub.tgl_terbit,
                (
                SELECT
                STRING_AGG(sdm.nm_sdm, ',')
                FROM
                pdrd.tulis_pub AS anggota
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                anggota.soft_delete=0
                AND anggota.id_publikasi=pub.id_publikasi
                ) AS anggota,
                (
                SELECT
                STRING_AGG(anggota.peran_tulis, ',')
            FROM
                pdrd.tulis_pub AS anggota
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm=anggota.id_sdm AND sdm.soft_delete=0
                WHERE
                anggota.soft_delete=0
                AND anggota.id_publikasi=pub.id_publikasi
                ) AS peran
            FROM
                pdrd.publikasi AS pub
                JOIN pdrd.tulis_pub AS ang ON ang.id_publikasi=pub.id_publikasi AND ang.soft_delete=0
            WHERE
                pub.soft_delete=0
                AND pub.id_jns_pub IN (41,42,43,44)
                AND ang.id_sdm='" .
                    $id .
                    "'
            ORDER BY
                pub.tgl_terbit DESC
        "
            ) ?? [];

        return $data;
    }

    public function pengajaran($id)
    {
        $data = DB::SELECT(
            "
            SELECT DISTINCT
                matkul.kode_mk,
                matkul.nm_mk,
                kelas.id_smt,
                kelas.sks_mk,
                sms.nm_lemb,
                kelas.nm_kls,
                sp.nm_lemb AS lembaga
            FROM
                pdrd.akt_ajar_dosen AS akt
                JOIN pdrd.reg_ptk AS ptk ON ptk.id_reg_ptk=akt.id_reg_ptk AND ptk.soft_delete=0
                JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp=ptk.id_sp AND sp.soft_delete=0
                JOIN pdrd.kelas_kuliah AS kelas ON kelas.id_kls=akt.id_kls AND kelas.soft_delete=0
                JOIN pdrd.matkul AS matkul ON matkul.id_mk=kelas.id_mk AND kelas.soft_delete=0
                JOIN pdrd.sms AS sms ON sms.id_sms=matkul.id_sms AND sms.soft_delete=0
            WHERE
                akt.soft_delete=0
                AND ptk.id_sdm='" .
                $id .
                "'
            ORDER BY
                kelas.id_smt DESC
        "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function bimbingan($id)
    {
        $data = DB::SELECT(
            "
            SELECT
                kat.nm_kat,
                akt.judul_akt_mhs,
                akt.id_smt,
                sms.nm_lemb,
                bimbing.urutan_promotor,
                jenis.nm_jns_akt_mhs
            FROM
                pdrd.bimbing_mhs AS bimbing
                JOIN ref.kategori_kegiatan AS kat ON kat.id_katgiat=bimbing.id_katgiat AND kat.expired_date IS NULL
                JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=bimbing.id_akt_mhs AND akt.soft_delete=0
                JOIN pdrd.sms AS sms ON sms.id_sms=akt.id_sms AND sms.soft_delete=0
                JOIN ref.jenis_akt_mhs AS jenis ON jenis.id_jns_akt_mhs=akt.id_jns_akt_mhs AND jenis.expired_date IS NULL
            WHERE
                bimbing.soft_delete=0
                AND bimbing.id_sdm='" .
                $id .
                "'
                AND jenis.id_jns_akt_mhs IN (1,2,3,4,22)
            ORDER BY
                akt.id_smt DESC
        "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function pengujian($id)
    {
        $data = DB::SELECT(
            "
            SELECT
                kat.nm_kat,
                akt.judul_akt_mhs,
                akt.id_smt,
                sms.nm_lemb,
                uji.urutan_uji,
                jenis.nm_jns_akt_mhs
            FROM
                pdrd.uji_mhs AS uji
                JOIN ref.kategori_kegiatan AS kat ON kat.id_katgiat=uji.id_katgiat AND kat.expired_date IS NULL
                JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=uji.id_akt_mhs AND akt.soft_delete=0
                JOIN pdrd.sms AS sms ON sms.id_sms=akt.id_sms AND sms.soft_delete=0
                JOIN ref.jenis_akt_mhs AS jenis ON jenis.id_jns_akt_mhs=akt.id_jns_akt_mhs AND jenis.expired_date IS NULL
            WHERE
                uji.soft_delete=0
                AND uji.id_sdm='" .
                $id .
                "'
            ORDER BY
                akt.id_smt DESC
        "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }
}
