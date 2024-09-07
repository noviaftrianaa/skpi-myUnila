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

    public static function getAgeData($tahun)
    {
        return DB::select("
            SELECT
                CASE
                    WHEN AgeCalc.age BETWEEN 15 AND 17 THEN '15-17'
                    WHEN AgeCalc.age BETWEEN 18 AND 19 THEN '18-19'
                    WHEN AgeCalc.age BETWEEN 20 AND 21 THEN '20-21'
                    ELSE '> 21'
                END AS usia_kategori,
                COUNT(*) AS total
            FROM temp_pmb.pengumuman AS pmb
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
}
