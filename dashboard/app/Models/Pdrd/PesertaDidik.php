<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class PesertaDidik extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.peserta_didik';
    protected $primaryKey = 'id_pd';

    public $timestamps = false;
    public $incrementing = false;

    public static function ktw($sms = '')
    {
        $data = collect(
        \DB::SELECT(
            "
            SELECT
                CAST(reg.id_reg_pd AS uniqueidentifier) AS id_reg_pd,
                pd.nm_pd,
                reg.tgl_keluar,
                reg.id_jns_keluar,
                CAST(sms.id_sms AS uniqueidentifier) AS id_sms,
                sms.nm_lemb AS prodi,
                jenjang.nm_jenj_didik AS jenjang,
                sms.sks_lulus,
                (
                    SELECT
                        TOP 1 mhs.total_sks
                    FROM
                        pdrd.kuliah_mhs AS mhs WITH ( NOLOCK )
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
                        pdrd.kuliah_mhs AS mhs WITH ( NOLOCK )
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
                        pdrd.nilai_smt_mhs as nilai WITH ( NOLOCK )
                        JOIN pdrd.kelas_kuliah AS kelas WITH ( NOLOCK ) ON kelas.id_kls = nilai.id_kls
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
                    WHEN sms.id_jenj_didik = 20 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 1 THEN 1
                    WHEN sms.id_jenj_didik = 21 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 22 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 3 THEN 1
                    WHEN sms.id_jenj_didik = 23 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 4 THEN 1
                    WHEN sms.id_jenj_didik = 30 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 4 THEN 1
                    WHEN sms.id_jenj_didik = 31 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 32 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 35 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 36 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 37 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN sms.id_jenj_didik = 40 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 3 THEN 1
                    WHEN sms.id_jenj_didik = 41 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 3 THEN 1
                    ELSE 0
                END AS status
            FROM
                pdrd.peserta_didik AS pd WITH ( NOLOCK )
                join pdrd.reg_pd AS reg WITH ( NOLOCK ) on reg.id_pd = pd.id_pd
                and reg.soft_delete = 0
                join pdrd.sms AS sms WITH ( NOLOCK ) on sms.id_sms = reg.id_sms
                and sms.soft_delete = 0
                join pdrd.sms AS fak WITH ( NOLOCK ) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                join ref.jenjang_pendidikan AS jenjang WITH ( NOLOCK ) ON jenjang.id_jenj_didik = sms.id_jenj_didik
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

        return $data;
    }

    public static function total_mhs($tahun)
    {
        $query = "
            SELECT
                p.nm_lemb,
                SUM(p.total) AS total
            FROM
                (
                    SELECT
                        fak.nm_lemb,
                        (
                            SELECT
                                COUNT(DISTINCT reg.id_pd)
                            FROM
                                pdrd.reg_pd AS reg WITH (NOLOCK)
                                JOIN pdrd.kuliah_mhs AS mhs WITH (NOLOCK) ON mhs.id_reg_pd = reg.id_reg_pd
                                AND mhs.soft_delete = 0
                            WHERE
                                reg.soft_delete = 0
                                AND reg.id_sms = sms.id_sms
                                AND SUBSTRING(mhs.id_smt,0,5) = '".$tahun."'
                        ) AS total
                    FROM
                        pdrd.sms AS sms WITH (NOLOCK)
                        JOIN pdrd.sms AS fak WITH (NOLOCK) ON fak.id_sms = sms.id_fak_unila
                        AND fak.soft_delete = 0
                    WHERE
                        sms.soft_delete = 0
                ) AS p
            GROUP BY
                p.nm_lemb
            ORDER BY
                p.nm_lemb ASC
        ";

        $data = \DB::SELECT($query);

        return collect($data);
    }

    public static function total_mhs_jenjang($tahun)
    {
        $query = "
        SELECT
            p.nm_jenj_didik,
            SUM(p.total) AS total
        FROM
            (
                SELECT
                    jp.nm_jenj_didik,
                    (
                        SELECT
                            COUNT(DISTINCT reg.id_pd)
                        FROM
                            pdrd.reg_pd AS reg WITH (NOLOCK)
                            JOIN pdrd.kuliah_mhs AS mhs WITH (NOLOCK) ON mhs.id_reg_pd = reg.id_reg_pd
                            AND mhs.soft_delete = 0
                        WHERE
                            reg.soft_delete = 0
                            AND mhs.id_stat_mhs IN ('A','M')
                            AND reg.id_sms = sms.id_sms
                            AND SUBSTRING(mhs.id_smt,0,5) = '".$tahun."'
                    ) AS total
                FROM
                    pdrd.sms AS sms WITH (NOLOCK)
                    JOIN ref.jenjang_pendidikan AS jp WITH (NOLOCK) ON jp.id_jenj_didik=sms.id_jenj_didik AND jp.expired_date IS NULL
                WHERE
                    sms.soft_delete = 0
            ) AS p
        GROUP BY
            p.nm_jenj_didik
        ORDER BY
            p.nm_jenj_didik ASC
        ";

        $data = \DB::SELECT($query);

        return collect($data);
    }

    public static function dashboard_mahasiswa($tipe,$smt,$level,$sms)
    {
        $from   = "FROM pdrd.peserta_didik AS tpd WITH (NOLOCK)
        ";
        $where = " WHERE tpd.soft_delete=0
                ";
        $group = '';
        $order = '';
        $alternative_where = '';
        if ($tipe=='rekap_mhs_semester') {
            $select = "SELECT
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi,
	            SUM(CASE WHEN (akm.id_stat_mhs='L' OR rpd.id_jns_keluar='1') THEN 1 ELSE 0 END) AS Lulus,
	            SUM(CASE WHEN (akm.id_stat_mhs='K' OR rpd.id_jns_keluar IN ('2','4','6','7')) THEN 1 ELSE 0 END) AS Keluar,
                SUM(CASE WHEN (akm.id_stat_mhs='A' AND rpd.id_jns_keluar IS NULL) THEN 1 ELSE 0 END) AS Aktif,
                SUM(CASE WHEN (akm.id_stat_mhs='M' AND rpd.id_jns_keluar IS NULL) THEN 1 ELSE 0 END) AS MBKM,
                SUM(CASE WHEN (akm.id_stat_mhs='D' OR rpd.id_jns_keluar = '3') THEN 1 ELSE 0 END) AS DO,
                SUM(CASE WHEN (akm.id_stat_mhs='N' AND rpd.id_jns_keluar NOT IN ('2','3','4','6','7')) THEN 1 ELSE 0 END) AS NonAktif,
                SUM(CASE WHEN akm.id_stat_mhs='C' THEN 1 ELSE 0 END) AS Cuti
            ";
            $join = "
                JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=tpd.id_pd AND rpd.soft_delete=0
                JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=rpd.id_reg_pd AND akm.soft_delete=0
                JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms AND tsms.soft_delete=0
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            ";
            $where .= " AND akm.id_smt='".$smt."'";
            $group .= " GROUP BY tsms.nm_lemb, tj.nm_jenj_didik";
        } elseif($tipe=='rekap_kewarganegaraan_mhs_semester') {
            $select = "SELECT
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi,
                SUM(CASE WHEN tpd.id_kewarganegaraan='ID' THEN 1 ELSE 0 END) AS Indonesia,
                SUM(CASE WHEN tpd.id_kewarganegaraan!='ID' THEN 1 ELSE 0 END) AS Asing
            ";
            $join = "
                JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=tpd.id_pd AND rpd.soft_delete=0
                JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=rpd.id_reg_pd AND akm.soft_delete=0
                JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms AND tsms.soft_delete=0
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            ";
            $where .= " AND akm.id_smt='".$smt."'";
            $group .= " GROUP BY tsms.nm_lemb, tj.nm_jenj_didik";
        } elseif($tipe=='rekap_ipk_mhs_semester') {
            $select = "SELECT
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi,";
            $select .= '
                SUM(CASE WHEN akm.ipk>=3 THEN 1 ELSE 0 END) AS "ipk >= 3",
                SUM(CASE WHEN akm.ipk<3 AND akm.ipk >=2.5 THEN 1 ELSE 0 END) AS "2,5 < ipk < 3",
                SUM(CASE WHEN akm.ipk<2.5 AND akm.ipk >=2 THEN 1 ELSE 0 END) AS "2 < ipk < 2,5",
                SUM(CASE WHEN akm.ipk<2 THEN 1 ELSE 0 END) AS "ipk < 2"
            ';
            $join = "
                JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=tpd.id_pd AND rpd.soft_delete=0
                JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=rpd.id_reg_pd AND akm.soft_delete=0
                JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms AND tsms.soft_delete=0
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            ";
            $where .= " AND akm.id_smt='".$smt."'";
            $group .= " GROUP BY tsms.nm_lemb, tj.nm_jenj_didik";
        } elseif($tipe=='rekap_masa_mukim_mhs_semester') {
            $select = "SELECT
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi,";
            $select .= '
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND (ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 4)) THEN 1 ELSE 0 END) AS "< 4 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND
                    (
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 4 AND
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 4.25
                    )) THEN 1 ELSE 0 END) AS "4 < x < 4.25 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND
                    (
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 4.25 AND
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 4.5
                    )) THEN 1 ELSE 0 END) AS "4.25 < x < 4.5 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND
                    (
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 4.5 AND
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 4.75
                    )) THEN 1 ELSE 0 END) AS "4.5 < x < 4.75 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND
                    (
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 4.75 AND
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 5
                    )) THEN 1 ELSE 0 END) AS "4.75 < x < 5 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND
                    (
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 5 AND
                        ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) <= 6
                    )) THEN 1 ELSE 0 END) AS "5 < x < 6 Tahun",
                SUM(CASE WHEN ((akm.id_stat_mhs=\'L\' OR rpd.id_jns_keluar=\'1\') AND ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) > 6) THEN 1 ELSE 0 END) AS "> 6 Tahun"
            ';
            $join = "
                JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=tpd.id_pd AND rpd.soft_delete=0
                JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=rpd.id_reg_pd AND akm.soft_delete=0
                JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms AND tsms.soft_delete=0
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            ";
            $where .= " AND akm.id_smt='".$smt."'";
            $group .= " GROUP BY tsms.nm_lemb, tj.nm_jenj_didik";
        } else {

        }
        if ($level!='pt') {
            if ($level=='prodi') {
                $alternative_where.=" AND tsms.id_sms='".$sms."'";
            } elseif ($level=='jurusan') {
                $alternative_where.=" AND tsms.id_jur_unila='".$sms."'";
            } elseif($level=='fakultas') {
                $alternative_where.=" AND tsms.id_fak_unila='".$sms."'";
            }
        }
        return DB::SELECT($select.$from.$join.$where.$alternative_where.$group.$order);
    }

    public static function get_daftar_mhs($level,$sms,$smt)
    {
        $query = "
            SELECT
                tpd.id_pd,
                tpd.nm_pd,
                rpd.nipd,
                akm.total_sks,
                akm.ipk,
	            akm.sks_semester,
                CASE WHEN rpd.id_jns_keluar IS NULL THEN sm.nm_stat_mhs ELSE jk.ket_keluar END status_mhs,
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi_homebase,
                ROUND(DATEDIFF(DAY, rpd.tgl_masuk_sp, rpd.tgl_keluar)/365.25, 2) AS masa_mukim,
                pa.nm_sdm
            FROM pdrd.peserta_didik AS tpd
            JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=tpd.id_pd AND rpd.soft_delete=0
            JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms AND tsms.soft_delete=0
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=rpd.id_reg_pd AND akm.soft_delete=0
                AND akm.id_smt=".$smt."
            JOIN ref.semester AS tsmt ON tsmt.id_smt=akm.id_smt
            LEFT JOIN (
                SELECT tsdm.nm_sdm, ang.id_reg_pd FROM pdrd.anggota_akt_mhs AS ang
                JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=ang.id_akt_mhs AND akt.soft_delete=0
                    AND akt.id_smt=".$smt."
                JOIN pdrd.bimbing_mhs AS bm ON bm.id_akt_mhs=akt.id_akt_mhs AND bm.soft_delete=0
                AND bm.id_katgiat='110601'
                JOIN pdrd.sdm AS tsdm ON tsdm.id_sdm=bm.id_sdm AND tsdm.soft_delete=0
                WHERE ang.soft_delete=0
            ) AS pa ON pa.id_reg_pd=rpd.id_reg_pd
            LEFT JOIN ref.jenis_keluar AS jk ON jk.id_jns_keluar=rpd.id_jns_keluar
            LEFT JOIN ref.status_mahasiswa AS sm ON sm.id_stat_mhs=akm.id_stat_mhs
            WHERE tpd.soft_delete=0
        ";
        if ($level!='pt') {
            if ($level=='prodi') {
                $query.=" AND tsms.id_sms='".$sms."'";
            } elseif ($level=='jurusan') {
                $query.=" AND tsms.id_jur_unila='".$sms."'";
            } elseif($level=='fakultas') {
                $query.=" AND tsms.id_fak_unila='".$sms."'";
            }
        }
        return DB::SELECT($query);
    }

    public static function getDetail($id_pd)
    {
        $data = DB::SELECT("
            SELECT
                tpd.id_pd,
                tpd.nm_pd,
                tpd.jk,
                tpd.nisn,
                tpd.nik,
                tpd.tmpt_lahir,
                tpd.tgl_lahir,
                tpd.jln,
                tpd.rt,
                tpd.rw,
                tpd.nm_dsn,
                tpd.ds_kel,
                a.nm_agama AS agama,
                n.nm_negara AS kewarganegaraan,
                sm.nm_stat_mhs
            FROM pdrd.peserta_didik AS tpd
            JOIN ref.agama AS a ON a.id_agama=tpd.id_agama
            JOIN ref.negara AS n ON n.id_negara=tpd.id_kewarganegaraan
            JOIN ref.status_mahasiswa AS sm ON sm.id_stat_mhs=tpd.id_stat_mhs
            WHERE tpd.id_pd='".$id_pd."'
        ");
        return collect($data)->first();
    }

    public static function getDetailHomebase($id_pd)
    {
        $data = DB::SELECT("
            SELECT
                rpd.id_reg_pd,
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi,
                rpd.nipd AS nim,
                jp.nm_jns_daftar,
                rpd.tgl_masuk_sp,
                rpd.tgl_keluar,
                jk.ket_keluar,
                smt.nm_smt,
                sp.nm_lemb AS nm_pt
            FROM pdrd.reg_pd AS rpd
            JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            JOIN ref.jenis_pendaftaran AS jp ON jp.id_jns_daftar=rpd.id_jns_daftar
            LEFT JOIN ref.jenis_keluar AS jk ON jk.id_jns_keluar=rpd.id_jns_keluar
            JOIN ref.semester AS smt ON smt.id_smt=rpd.id_smt
            JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp=rpd.id_sp
            WHERE rpd.id_pd='".$id_pd."'
            ORDER BY rpd.id_smt DESC
        ");
        return $data;
    }

    public static function getStatusSmtMhs($id_pd)
    {
        $data = DB::SELECT("
            SELECT
                rpd.id_reg_pd,
                CONCAT(sp.nm_lemb,' - ',tsms.nm_lemb,' (',tj.nm_jenj_didik,') - ',rpd.nipd) AS prodi,
                sm.nm_stat_mhs,
                smt.nm_smt,
                km.ips,
                km.ipk,
                km.total_sks,
                pem.nm_pembiayaan,
                km.biaya_smt,
                reg_kuliah.sks_reg,
                mbkm_kuliah.sks_mbkm
            FROM pdrd.reg_pd AS rpd
            JOIN pdrd.sms AS tsms ON tsms.id_sms=rpd.id_sms
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp=rpd.id_sp
            JOIN pdrd.kuliah_mhs AS km ON km.id_reg_pd=rpd.id_reg_pd AND km.soft_delete=0
            JOIN ref.semester AS smt ON smt.id_smt=km.id_smt
            LEFT JOIN ref.pembiayaan AS pem ON pem.id_pembiayaan=km.id_pembiayaan
            LEFT JOIN ref.status_mahasiswa AS sm ON sm.id_stat_mhs=km.id_stat_mhs
            LEFT JOIN (
                SELECT nilai.id_reg_pd, kk.id_smt, SUM(kk.sks_mk) AS sks_reg FROM pdrd.nilai_smt_mhs AS nilai
                LEFT JOIN pdrd.kelas_kuliah AS kk ON kk.id_kls=nilai.id_kls AND kk.soft_delete=0
                WHERE nilai.soft_delete=0
                GROUP BY nilai.id_reg_pd, kk.id_smt
            ) AS reg_kuliah ON reg_kuliah.id_smt=km.id_smt AND reg_kuliah.id_reg_pd=rpd.id_reg_pd
            LEFT JOIN (
                SELECT m.id_reg_pd, m.id_smt, SUM(m.sks_mk) AS sks_mbkm
                FROM (
                    SELECT DISTINCT ang.id_reg_pd, akt.id_smt, kam.id_mk, kam.sks_mk FROM mbkm.konversi_akt_mhs AS kam
                    JOIN pdrd.anggota_akt_mhs AS ang ON ang.id_ang_akt_mhs=kam.id_ang_akt_mhs AND ang.soft_delete=0
                        AND ang.id_akt_mhs=kam.id_akt_mhs
                    JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=kam.id_akt_mhs AND akt.soft_delete=0
                    WHERE kam.soft_delete=0
                ) AS m
                GROUP BY m.id_reg_pd, m.id_smt
            ) AS mbkm_kuliah ON mbkm_kuliah.id_smt=km.id_smt AND mbkm_kuliah.id_reg_pd=rpd.id_reg_pd
            WHERE rpd.id_pd='".$id_pd."'
            ORDER BY rpd.id_smt DESC, km.id_smt DESC
        ");
        return collect($data)->groupBy('prodi')->toArray();
    }
}
