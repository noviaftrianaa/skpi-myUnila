<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PenelitianRepository
{
    /**
     * Get penelitian statistics by skim kegiatan
     * Grouped by skim, counting distinct litabmas (penelitian only)
     *
     * @return array
     */
    public function getPenelitianByKategori(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                COALESCE(sk.nm_skim, 'Lainnya') AS kategori,
                COUNT(DISTINCT l.id_litabmas) AS jumlah
            FROM pdrd.litabmas AS l
            -- Join ke sdm_anggota_litabmas untuk mendapatkan anggota
            INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                ON sal.id_litabmas = l.id_litabmas
                AND sal.soft_delete = 0
            -- Join ke sdm untuk filter dosen Unila
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12' -- Dosen
            -- Join ke reg_ptk untuk filter dosen aktif di Unila
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            -- Join ke sms untuk filter prodi aktif
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            -- Join ke jenjang_pendidikan untuk filter hanya D% dan S%
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            -- Left join ke skim kegiatan
            LEFT JOIN ref.skim_kegiatan AS sk
                ON sk.id_skim = l.id_skim
            WHERE l.soft_delete = 0
                AND l.jns_litabmas = 'L' -- L = Penelitian (Litbang)
            GROUP BY sk.nm_skim
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            return [
                'kategori' => $item->kategori,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get total penelitian count (including pengabdian for 5 years)
     *
     * @return int
     */
    public function getTotalPenelitian(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT COUNT(DISTINCT l.id_litabmas) AS total
            FROM pdrd.litabmas AS l
            INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                ON sal.id_litabmas = l.id_litabmas
                AND sal.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE l.soft_delete = 0
                AND l.jns_litabmas IN ('L', 'M') -- Include both penelitian and pengabdian
                AND l.id_thn_kegiatan IS NOT NULL
                AND l.id_thn_kegiatan >= YEAR(GETDATE()) - 5
                AND l.id_thn_kegiatan <= YEAR(GETDATE())
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get penelitian statistics by year (last 5 years)
     *
     * @return array
     */
    public function getPenelitianByYear(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                l.id_thn_kegiatan AS tahun,
                COUNT(DISTINCT l.id_litabmas) AS jumlah
            FROM pdrd.litabmas AS l
            INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                ON sal.id_litabmas = l.id_litabmas
                AND sal.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE l.soft_delete = 0
                AND l.jns_litabmas IN ('L', 'M') -- Include both penelitian and pengabdian
                AND l.id_thn_kegiatan IS NOT NULL
                AND l.id_thn_kegiatan >= YEAR(GETDATE()) - 5
                AND l.id_thn_kegiatan <= YEAR(GETDATE())
            GROUP BY l.id_thn_kegiatan
            ORDER BY tahun DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            return [
                'tahun' => (int) $item->tahun,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get penelitian funding by year (dana per tahun)
     * Includes dana_dikti, dana_pt, dana_institusi_lain
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of funding data by year
     */
    public function getPenelitianFundingByYear(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            -- First get distinct penelitian/pengabdian IDs that involve Unila dosen
            WITH UnilaPenelitian AS (
                SELECT DISTINCT l.id_litabmas
                FROM pdrd.litabmas AS l
                INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                    ON sal.id_litabmas = l.id_litabmas
                    AND sal.soft_delete = 0
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = sal.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = ptk.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS didik
                    ON didik.id_jenj_didik = sms.id_jenj_didik
                    AND didik.expired_date IS NULL
                WHERE l.soft_delete = 0
                    AND l.jns_litabmas IN ('L', 'M')
                    AND l.id_thn_kegiatan IS NOT NULL
                    AND l.id_thn_kegiatan >= ?
                    AND l.id_thn_kegiatan <= ?
            )
            -- Then sum the funding without duplication
            SELECT
                l.id_thn_kegiatan AS tahun,
                SUM(ISNULL(l.dana_dikti, 0)) AS dana_dikti,
                SUM(ISNULL(l.dana_pt, 0)) AS dana_pt,
                SUM(ISNULL(l.dana_institusi_lain, 0)) AS dana_institusi_lain,
                SUM(ISNULL(l.dana_dikti, 0) + ISNULL(l.dana_pt, 0) + ISNULL(l.dana_institusi_lain, 0)) AS total_dana
            FROM pdrd.litabmas AS l
            INNER JOIN UnilaPenelitian AS up
                ON up.id_litabmas = l.id_litabmas
            GROUP BY l.id_thn_kegiatan
            ORDER BY tahun DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function($item) {
            return [
                'tahun' => (int) $item->tahun,
                'dana_dikti' => (int) $item->dana_dikti,
                'dana_pt' => (int) $item->dana_pt,
                'dana_institusi_lain' => (int) $item->dana_institusi_lain,
                'total_dana' => (int) $item->total_dana,
            ];
        }, $result);
    }

    /**
     * Get penelitian by kelompok bidang
     * Top 10 kelompok bidang (Ilmu Hukum, Kimia, dll)
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of kelompok bidang with counts
     */
    public function getPenelitianByKelompokBidang(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT TOP 10
                COALESCE(kb.nm_kel_bidang, 'Lainnya') AS kelompok_bidang,
                COUNT(DISTINCT l.id_litabmas) AS jumlah
            FROM pdrd.litabmas AS l
            INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                ON sal.id_litabmas = l.id_litabmas
                AND sal.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN ref.kelompok_bidang AS kb
                ON kb.id_kel_bidang = l.id_kel_bidang
            WHERE l.soft_delete = 0
                AND l.jns_litabmas IN ('L', 'M') -- Include both penelitian and pengabdian
                AND l.id_thn_kegiatan IS NOT NULL
                AND l.id_thn_kegiatan >= ?
                AND l.id_thn_kegiatan <= ?
            GROUP BY kb.nm_kel_bidang
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function($item) {
            return [
                'kelompok_bidang' => $item->kelompok_bidang,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get penelitian statistics by fakultas
     * Only includes penelitian from active Unila dosen
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of fakultas with counts
     */
    public function getPenelitianByFakultas(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                fak.id_sms,
                fak.nm_lemb AS fakultas,
                COUNT(DISTINCT l.id_litabmas) AS jumlah
            FROM pdrd.litabmas AS l
            INNER JOIN pdrd.sdm_anggota_litabmas AS sal
                ON sal.id_litabmas = l.id_litabmas
                AND sal.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12' -- Dosen
            -- Get only latest reg_ptk per dosen (avoid duplicates)
            INNER JOIN (
                SELECT
                    id_sdm,
                    id_sms,
                    id_sp,
                    tgl_srt_tgs,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
                FROM pdrd.reg_ptk
                WHERE soft_delete = 0
                    AND id_jns_keluar IS NULL
            ) AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.rn = 1
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms_prodi
                ON sms_prodi.id_sms = ptk.id_sms
                AND sms_prodi.soft_delete = 0
                AND sms_prodi.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jp
                ON jp.id_jenj_didik = sms_prodi.id_jenj_didik
                AND (jp.nm_jenj_didik LIKE 'D%' OR jp.nm_jenj_didik LIKE 'S%')
            -- Join to fakultas (sms lagi menggunakan id_fak_unila)
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms_prodi.id_fak_unila
                AND fak.soft_delete = 0
            WHERE l.soft_delete = 0
                AND l.jns_litabmas IN ('L', 'M') -- Include both penelitian and pengabdian
                AND l.id_thn_kegiatan IS NOT NULL
                AND l.id_thn_kegiatan >= ?
                AND l.id_thn_kegiatan <= ?
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function ($item) {
            return [
                'fakultas' => $item->fakultas,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }
}
