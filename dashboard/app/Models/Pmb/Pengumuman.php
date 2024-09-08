<?php

namespace App\Models\Pmb;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use DB;

class Pengumuman extends Model
{
    protected $table = 'temp_pmb.pengumuman';

    public static function getStatusData($tahun)
    {
        $tahunAwal = $tahun - 1;
        $tahunAkhir = $tahun;

        return DB::select("
            SELECT
                pmb.id_thn_ajaran,
                SUM(CASE WHEN pmb.status_lulus = 'Lulus' THEN 1 ELSE 0 END) AS lulus,
                SUM(CASE WHEN pmb.status_lulus = 'Tidak Lulus' THEN 1 ELSE 0 END) AS tidak_lulus
            FROM temp_pmb.pengumuman AS pmb WITH(NOLOCK)
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran BETWEEN ? AND ?
            GROUP BY pmb.id_thn_ajaran
            ORDER BY pmb.id_thn_ajaran ASC
        ", [$tahunAwal, $tahunAkhir]);

    }

    public static function getJenisPendaftaranData($tahun)
    {
        return DB::select("
            SELECT
                pmb.jenis_pendaftaran,
                COUNT(*) AS total
            FROM temp_pmb.pengumuman AS pmb WITH(NOLOCK)
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran = ?
            GROUP BY pmb.jenis_pendaftaran
        ", [$tahun]);
    }

    public static function getUsiaData($tahun)
    {
        return DB::select("
            SELECT
                CASE
                    WHEN AgeCalc.age BETWEEN 15 AND 17 THEN '15-17'
                    WHEN AgeCalc.age BETWEEN 18 AND 19 THEN '18-19'
                    WHEN AgeCalc.age BETWEEN 20 AND 21 THEN '20-21'
                    ELSE '> 21'
                END AS kategori_usia,
                COUNT(*) AS total
            FROM temp_pmb.pengumuman AS pmb WITH(NOLOCK)
                CROSS APPLY (
            SELECT CAST(pmb.id_thn_ajaran AS INT) - YEAR(pmb.tgl_lahir) AS age
        ) AS AgeCalc
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran = ?
            GROUP BY CASE
                WHEN AgeCalc.age BETWEEN 15 AND 17 THEN '15-17'
                WHEN AgeCalc.age BETWEEN 18 AND 19 THEN '18-19'
                WHEN AgeCalc.age BETWEEN 20 AND 21 THEN '20-21'
                ELSE '> 21'
            END
        ", [$tahun]);
    }

    public static function getJenisKelaminData($tahun)
    {
        return DB::select("
            SELECT
                CASE
                    WHEN pmb.jns_kelamin = 'L' THEN 'Laki-laki'
                    WHEN pmb.jns_kelamin = 'P' THEN 'Perempuan'
                END AS jns_kelamin,
                COUNT(*) AS total
            FROM temp_pmb.pengumuman AS pmb WITH(NOLOCK)
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran = ?
            GROUP BY pmb.jns_kelamin
        ", [$tahun]);
    }

    public static function getFakultasData($tahun)
    {
        return DB::select("
            SELECT
                fak_lulus.nm_lemb AS nama_fakultas,
                COUNT(pmb.no_peserta) AS total
            FROM temp_pmb.pengumuman AS pmb WITH(NOLOCK)
            LEFT JOIN pdrd.sms AS fak_lulus WITH(NOLOCK)
                ON fak_lulus.id_sms = pmb.fak_lulus AND fak_lulus.soft_delete = 0
            WHERE pmb.soft_delete = 0
            AND pmb.status_lulus = 'Lulus'
            AND pmb.id_thn_ajaran = ?
            GROUP BY fak_lulus.nm_lemb
            ORDER BY nama_fakultas ASC
        ", [$tahun]);
    }

    public static function getTopProdiData($tahun)
    {
        return DB::select("
            SELECT TOP 10
                CONCAT(jenj_lulus.nm_jenj_didik, '-', prodi_lulus.nm_lemb) AS nm_prodi_lulus,
                COUNT(pmb.no_peserta) AS total
            FROM
                temp_pmb.pengumuman AS pmb WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS prodi_lulus WITH(NOLOCK)
                    ON prodi_lulus.id_sms = pmb.prodi_lulus AND prodi_lulus.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj_lulus WITH(NOLOCK)
                    ON jenj_lulus.id_jenj_didik = prodi_lulus.id_jenj_didik AND jenj_lulus.expired_date IS NULL
            WHERE
                pmb.soft_delete = 0
                AND pmb.status_lulus = 'Lulus'
                AND pmb.id_thn_ajaran = ?
            GROUP BY
                CONCAT(jenj_lulus.nm_jenj_didik, '-', prodi_lulus.nm_lemb)
            ORDER BY
                total DESC
        ", [$tahun]);
    }

    public static function getRataRataData($tahun)
    {
        return DB::select("
            SELECT
                ROUND(MAX(pmb.nilai_utbk), 2) AS max_nilai_utbk,
                CAST(ROUND(AVG(pmb.nilai_utbk), 2) AS DECIMAL(10,2)) AS avg_nilai_utbk,
                ROUND(MIN(pmb.nilai_utbk), 2) AS min_nilai_utbk,
                ROUND(MAX(pmb.nilai_wawancara), 2) AS max_nilai_wawancara,
                CAST(ROUND(AVG(pmb.nilai_wawancara), 2) AS DECIMAL(10,2)) AS avg_nilai_wawancara,
                ROUND(MIN(pmb.nilai_wawancara), 2) AS min_nilai_wawancara
            FROM temp_pmb.pengumuman AS pmb
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran = ?
        ", [$tahun]);
    }


    public static function getNilaiData($tahun)
    {
        return DB::select("
            SELECT
                CASE
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 708.77 THEN '708,77 - 856,68'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 560.86 THEN '560,86 - 708,77'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 412.95 THEN '412,95 - 560,86'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 10.00 THEN '<= 412,95'
                    ELSE 'Tidak Ujian'
                END AS kategori_nilai_utbk,
                CASE
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 688.66 THEN '688,66 - 983,00'
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 394.33 THEN '394,33 - 688,66'
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 100 THEN '100,00 - 394,33'
                    ELSE 'Tidak Wawancara'
                END AS kategori_nilai_wawancara,
                COUNT(pmb.no_peserta) AS total_peserta
            FROM temp_pmb.pengumuman AS pmb
            WHERE pmb.soft_delete = 0
            AND pmb.id_thn_ajaran = ?
            GROUP BY
                CASE
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 708.77 THEN '708,77 - 856,68'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 560.86 THEN '560,86 - 708,77'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 412.95 THEN '412,95 - 560,86'
                    WHEN ROUND(pmb.nilai_utbk, 2) >= 10.00 THEN '<= 412,95'
                    ELSE 'Tidak Ujian'
                END,
                CASE
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 688.66 THEN '688,66 - 983,00'
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 394.33 THEN '394,33 - 688,66'
                    WHEN ROUND(pmb.nilai_wawancara, 2) >= 100 THEN '100,00 - 394,33'
                    ELSE 'Tidak Wawancara'
                END
        ", [$tahun]);
    }

}
