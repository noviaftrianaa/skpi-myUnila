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
                SUM(CASE WHEN akm.id_stat_mhs='N' THEN 1 ELSE 0 END) AS NonAktif,
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
}
