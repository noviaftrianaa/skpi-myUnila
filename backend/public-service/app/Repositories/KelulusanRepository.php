<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class KelulusanRepository
{
    /**
     * Get total lulusan (graduated students) for active academic year only
     *
     * @return int Total graduates
     */
    public function getTotalLulusan(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT COUNT(DISTINCT reg.id_reg_pd) AS total
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                            WHERE pd.soft_delete = 0
                AND reg.id_jns_keluar = '1' -- Lulus
                AND reg.tgl_masuk_sp IS NOT NULL
                AND reg.tgl_keluar IS NOT NULL
                AND reg.no_seri_ijazah IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) IN (
                    SELECT DISTINCT id_thn_ajaran
                    FROM ref.semester
                    WHERE a_periode_aktif = 1
                )
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get graduation statistics by year
     * Shows tepat waktu vs tidak tepat waktu per year
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of graduation stats by year
     */
    public function getKelulusanByYear(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                YEAR(reg.tgl_keluar) AS tahun,
                COUNT(DISTINCT reg.id_reg_pd) AS total_lulusan,
                SUM(
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
                    END
                ) AS tepat_waktu,
                SUM(
                    CASE
                        WHEN sms.id_jenj_didik = 20 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 1 THEN 1
                        WHEN sms.id_jenj_didik = 21 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 22 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 3 THEN 1
                        WHEN sms.id_jenj_didik = 23 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 4 THEN 1
                        WHEN sms.id_jenj_didik = 30 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 4 THEN 1
                        WHEN sms.id_jenj_didik = 31 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 32 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 35 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 36 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 37 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 2 THEN 1
                        WHEN sms.id_jenj_didik = 40 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 3 THEN 1
                        WHEN sms.id_jenj_didik = 41 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) > 3 THEN 1
                        ELSE 0
                    END
                ) AS tidak_tepat_waktu
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                            WHERE pd.soft_delete = 0
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_masuk_sp IS NOT NULL
                AND reg.tgl_keluar IS NOT NULL
                AND reg.no_seri_ijazah IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
            GROUP BY YEAR(reg.tgl_keluar)
            ORDER BY tahun DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function($item) {
            $tepatWaktu = (int) $item->tepat_waktu;
            $tidakTepatWaktu = (int) $item->tidak_tepat_waktu;
            $total = (int) $item->total_lulusan;
            $persentaseTepatWaktu = $total > 0 ? round(($tepatWaktu / $total) * 100, 2) : 0;

            return [
                'tahun' => (int) $item->tahun,
                'total_lulusan' => $total,
                'tepat_waktu' => $tepatWaktu,
                'tidak_tepat_waktu' => $tidakTepatWaktu,
                'persentase_tepat_waktu' => $persentaseTepatWaktu,
            ];
        }, $result);
    }

    /**
     * Get graduation statistics by jenjang for active academic year only
     *
     * @return array Array of graduation stats by jenjang
     */
    public function getKelulusanByJenjang(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                jenjang.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT reg.id_reg_pd) AS total_lulusan,
                SUM(
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
                    END
                ) AS tepat_waktu
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                            WHERE pd.soft_delete = 0
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_masuk_sp IS NOT NULL
                AND reg.tgl_keluar IS NOT NULL
                AND reg.no_seri_ijazah IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) IN (
                    SELECT DISTINCT id_thn_ajaran
                    FROM ref.semester
                    WHERE a_periode_aktif = 1
                )
            GROUP BY jenjang.nm_jenj_didik
            ORDER BY total_lulusan DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            $tepatWaktu = (int) $item->tepat_waktu;
            $total = (int) $item->total_lulusan;
            $persentaseTepatWaktu = $total > 0 ? round(($tepatWaktu / $total) * 100, 2) : 0;

            return [
                'jenjang' => $item->jenjang,
                'total_lulusan' => $total,
                'tepat_waktu' => $tepatWaktu,
                'persentase_tepat_waktu' => $persentaseTepatWaktu,
            ];
        }, $result);
    }

    /**
     * Get kelulusan by masa studi and IPK for active academic year only
     *
     * @return array Kelulusan data by masa studi with average IPK
     */
    public function getKelulusanByMasaStudi(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                kategori_masa_studi,
                jumlah_lulusan,
                rata_rata_ipk
            FROM (
                SELECT
                    CASE
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 3.5 THEN '< 3.5 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 3.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4 THEN '3.5 - 4 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4.5 THEN '4 - 4.5 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 5 THEN '4.5 - 5 Tahun'
                        ELSE '> 5 Tahun'
                    END AS kategori_masa_studi,
                    COUNT(DISTINCT reg.id_reg_pd) AS jumlah_lulusan,
                    ROUND(AVG(CAST(reg.ipk AS FLOAT)), 2) AS rata_rata_ipk,
                    CASE
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 3.5 THEN 1
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 3.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4 THEN 2
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4.5 THEN 3
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 5 THEN 4
                        ELSE 5
                    END AS urutan
                FROM pdrd.peserta_didik AS pd
                INNER JOIN pdrd.reg_pd AS reg
                    ON reg.id_pd = pd.id_pd
                    AND reg.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS jenjang
                    ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                                    WHERE pd.soft_delete = 0
                    AND reg.id_jns_keluar = '1'
                    AND reg.tgl_masuk_sp IS NOT NULL
                    AND reg.tgl_keluar IS NOT NULL
                    AND reg.no_seri_ijazah IS NOT NULL
                    AND reg.ipk IS NOT NULL
                    AND CAST(reg.ipk AS FLOAT) > 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND YEAR(reg.tgl_keluar) IN (
                        SELECT DISTINCT id_thn_ajaran
                        FROM ref.semester
                        WHERE a_periode_aktif = 1
                    )
                GROUP BY
                    CASE
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 3.5 THEN '< 3.5 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 3.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4 THEN '3.5 - 4 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4.5 THEN '4 - 4.5 Tahun'
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 5 THEN '4.5 - 5 Tahun'
                        ELSE '> 5 Tahun'
                    END,
                    CASE
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 3.5 THEN 1
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 3.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4 THEN 2
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 4.5 THEN 3
                        WHEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) >= 4.5 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) < 5 THEN 4
                        ELSE 5
                    END
            ) AS data
            ORDER BY urutan
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            return [
                'kategori' => $item->kategori_masa_studi,
                'jumlah' => (int) $item->jumlah_lulusan,
                'avg_ipk' => round((float) $item->rata_rata_ipk, 2),
            ];
        }, $result);
    }

    /**
     * Get kelulusan statistics by fakultas for active academic year only
     *
     * @return array Array of fakultas with counts
     */
    public function getKelulusanByFakultas(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                fak.id_sms,
                fak.nm_lemb AS fakultas,
                COUNT(DISTINCT reg.id_reg_pd) AS total_lulusan,
                SUM(
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
                    END
                ) AS tepat_waktu
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                            -- Join to fakultas (sms lagi menggunakan id_fak_unila)
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            WHERE pd.soft_delete = 0
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_masuk_sp IS NOT NULL
                AND reg.tgl_keluar IS NOT NULL
                AND reg.no_seri_ijazah IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) IN (
                    SELECT DISTINCT id_thn_ajaran
                    FROM ref.semester
                    WHERE a_periode_aktif = 1
                )
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY total_lulusan DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            $tepatWaktu = (int) $item->tepat_waktu;
            $total = (int) $item->total_lulusan;
            $persentaseTepatWaktu = $total > 0 ? round(($tepatWaktu / $total) * 100, 2) : 0;

            return [
                'fakultas' => $item->fakultas,
                'total_lulusan' => $total,
                'tepat_waktu' => $tepatWaktu,
                'persentase_tepat_waktu' => $persentaseTepatWaktu,
            ];
        }, $result);
    }
}
