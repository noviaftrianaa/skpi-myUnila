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
}
