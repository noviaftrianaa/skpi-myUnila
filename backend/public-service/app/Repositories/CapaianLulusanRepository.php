<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class CapaianLulusanRepository
{
    /**
     * Get tracer study statistics untuk seluruh universitas
     * Filter berdasarkan tgl_keluar 5 tahun terakhir
     *
     * @return array
     */
    public function getTracerStudyStatistics(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        // Get total alumni and basic stats
        $sqlStats = "
            SELECT
                COUNT(DISTINCT hts.id_reg_pd) AS total_alumni,
                AVG(CASE WHEN hts.wkt_tunggu IS NOT NULL THEN CAST(hts.wkt_tunggu AS FLOAT) ELSE NULL END) AS avg_waktu_tunggu,
                AVG(CASE WHEN hts.income_per_bln IS NOT NULL AND hts.income_per_bln >= 100000 AND hts.income_per_bln <= 50000000 THEN CAST(hts.income_per_bln AS FLOAT) ELSE NULL END) AS avg_income,
                SUM(CASE WHEN hts.a_kerja_sblm_lulus = 1 THEN 1 ELSE 0 END) AS bekerja_sebelum_lulus,
                SUM(CASE WHEN hts.status_lulusan = 1 THEN 1 ELSE 0 END) AS status_bekerja,
                SUM(CASE WHEN hts.status_lulusan = 2 THEN 1 ELSE 0 END) AS status_wiraswasta,
                SUM(CASE WHEN hts.status_lulusan = 3 THEN 1 ELSE 0 END) AS status_kuliah_lanjut,
                SUM(CASE WHEN hts.status_lulusan = 4 THEN 1 ELSE 0 END) AS status_belum_bekerja
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
        ";

        $result = DB::connection('sqlsrv')->select($sqlStats, [$unilaIdSp, $startYear, $currentYear]);
        $statsData = $result[0] ?? null;

        return [
            'total_alumni' => (int) ($statsData->total_alumni ?? 0),
            'avg_waktu_tunggu' => round((float) ($statsData->avg_waktu_tunggu ?? 0), 1),
            'avg_income' => (float) ($statsData->avg_income ?? 0),
            'bekerja_sebelum_lulus' => (int) ($statsData->bekerja_sebelum_lulus ?? 0),
            'persentase_bekerja_sebelum_lulus' => $statsData && $statsData->total_alumni > 0
                ? round(($statsData->bekerja_sebelum_lulus / $statsData->total_alumni) * 100, 1)
                : 0,
            'status_lulusan' => [
                'bekerja' => (int) ($statsData->status_bekerja ?? 0),
                'wiraswasta' => (int) ($statsData->status_wiraswasta ?? 0),
                'kuliah_lanjut' => (int) ($statsData->status_kuliah_lanjut ?? 0),
                'belum_bekerja' => (int) ($statsData->status_belum_bekerja ?? 0),
            ],
        ];
    }

    /**
     * Get kesesuaian bidang kerja distribution
     *
     * @return array
     */
    public function getKesesuaianBidangKerja(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                hts.hub_bidang_kerja,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.hub_bidang_kerja IS NOT NULL
            GROUP BY hts.hub_bidang_kerja
            ORDER BY hts.hub_bidang_kerja
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        $labels = [
            1 => 'Sangat Sesuai',
            2 => 'Sesuai',
            3 => 'Cukup Sesuai',
            4 => 'Tidak Sesuai',
        ];

        return array_map(function ($item) use ($labels) {
            return [
                'tingkat' => (int) $item->hub_bidang_kerja,
                'label' => $labels[$item->hub_bidang_kerja] ?? 'Tidak Diketahui',
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get level perusahaan distribution
     *
     * @return array
     */
    public function getLevelPerusahaan(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                hts.level_perusahaan,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.level_perusahaan IS NOT NULL
                AND hts.level_perusahaan != ''
            GROUP BY hts.level_perusahaan
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function ($item) {
            return [
                'level' => $item->level_perusahaan,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get waktu tunggu trend by year
     *
     * @return array
     */
    public function getWaktuTungguTrend(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                YEAR(reg.tgl_keluar) AS tahun,
                AVG(CASE WHEN hts.wkt_tunggu IS NOT NULL THEN CAST(hts.wkt_tunggu AS FLOAT) ELSE NULL END) AS avg_waktu_tunggu,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.wkt_tunggu IS NOT NULL
            GROUP BY YEAR(reg.tgl_keluar)
            ORDER BY tahun DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function ($item) {
            return [
                'tahun' => (int) $item->tahun,
                'avg_waktu_tunggu' => round((float) $item->avg_waktu_tunggu, 1),
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get income distribution by range
     *
     * @return array
     */
    public function getIncomeDistribution(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN '< 1 Juta'
                    WHEN hts.income_per_bln >= 1000000 AND hts.income_per_bln < 3000000 THEN '1-3 Juta'
                    WHEN hts.income_per_bln >= 3000000 AND hts.income_per_bln < 5000000 THEN '3-5 Juta'
                    WHEN hts.income_per_bln >= 5000000 AND hts.income_per_bln < 10000000 THEN '5-10 Juta'
                    WHEN hts.income_per_bln >= 10000000 THEN '> 10 Juta'
                    ELSE 'Tidak Diketahui'
                END AS income_range,
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN 1
                    WHEN hts.income_per_bln >= 1000000 AND hts.income_per_bln < 3000000 THEN 2
                    WHEN hts.income_per_bln >= 3000000 AND hts.income_per_bln < 5000000 THEN 3
                    WHEN hts.income_per_bln >= 5000000 AND hts.income_per_bln < 10000000 THEN 4
                    WHEN hts.income_per_bln >= 10000000 THEN 5
                    ELSE 6
                END AS urutan,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.income_per_bln IS NOT NULL
                AND hts.income_per_bln >= 100000
                AND hts.income_per_bln <= 50000000
            GROUP BY
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN '< 1 Juta'
                    WHEN hts.income_per_bln >= 1000000 AND hts.income_per_bln < 3000000 THEN '1-3 Juta'
                    WHEN hts.income_per_bln >= 3000000 AND hts.income_per_bln < 5000000 THEN '3-5 Juta'
                    WHEN hts.income_per_bln >= 5000000 AND hts.income_per_bln < 10000000 THEN '5-10 Juta'
                    WHEN hts.income_per_bln >= 10000000 THEN '> 10 Juta'
                    ELSE 'Tidak Diketahui'
                END,
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN 1
                    WHEN hts.income_per_bln >= 1000000 AND hts.income_per_bln < 3000000 THEN 2
                    WHEN hts.income_per_bln >= 3000000 AND hts.income_per_bln < 5000000 THEN 3
                    WHEN hts.income_per_bln >= 5000000 AND hts.income_per_bln < 10000000 THEN 4
                    WHEN hts.income_per_bln >= 10000000 THEN 5
                    ELSE 6
                END
            ORDER BY urutan
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function ($item) {
            return [
                'range' => $item->income_range,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get alumni work location by province (Indonesia only)
     *
     * @return array
     */
    public function getLokasiKerjaByProvinsi(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                wil.id_wil,
                wil.nm_wil AS provinsi,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = hts.id_wil
                AND wil.id_level_wil = 1
                AND wil.id_negara = 'ID'
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.id_wil IS NOT NULL
                AND wil.id_wil IS NOT NULL
            GROUP BY wil.id_wil, wil.nm_wil
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function ($item) {
            return [
                'id_provinsi' => trim($item->id_wil),
                'provinsi' => $item->provinsi,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get alumni working abroad (international)
     *
     * @return array
     */
    public function getLokasiKerjaInternational(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 5;

        $sql = "
            SELECT
                wil.id_negara,
                negara.nm_negara,
                COUNT(DISTINCT hts.id_reg_pd) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                AND (jenjang.nm_jenj_didik LIKE 'D%' OR jenjang.nm_jenj_didik LIKE 'S%')
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = hts.id_wil
            LEFT JOIN ref.negara AS negara
                ON negara.id_negara = wil.id_negara
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) >= ?
                AND YEAR(reg.tgl_keluar) <= ?
                AND hts.id_wil IS NOT NULL
                AND wil.id_negara IS NOT NULL
                AND wil.id_negara <> 'ID'
            GROUP BY wil.id_negara, negara.nm_negara
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function ($item) {
            return [
                'id_negara' => trim($item->id_negara),
                'negara' => $item->nm_negara ?? 'Unknown',
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }
}
