<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PublikasiRepository
{
    /**
     * Get publikasi statistics by jenis publikasi
     * Grouped by jenis_publikasi, counting distinct publikasi
     *
     * @return array
     */
    public function getPublikasiByJenis(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 4; // 5 tahun terakhir (termasuk tahun ini)

        $sql = "
            SELECT
                COALESCE(jp.nm_jns_pub, 'Lainnya') AS jenis,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            -- Join ke tulis_pub untuk mendapatkan penulis
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            -- Join ke sdm untuk filter dosen Unila
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
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
            -- Left join ke jenis publikasi
            LEFT JOIN ref.jenis_publikasi AS jp
                ON jp.id_jns_pub = p.id_jns_pub
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
            GROUP BY jp.nm_jns_pub
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return array_map(function($item) {
            return [
                'jenis' => $item->jenis,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get total publikasi count
     *
     * @return int
     */
    public function getTotalPublikasi(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 4; // 5 tahun terakhir (termasuk tahun ini)

        $sql = "
            SELECT COUNT(DISTINCT p.id_publikasi) AS total
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
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
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $currentYear]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get publikasi statistics by year (last 5 years)
     *
     * @return array
     */
    public function getPublikasiByYear(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                YEAR(p.tgl_terbit) AS tahun,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
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
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= YEAR(GETDATE()) - 4
                AND YEAR(p.tgl_terbit) <= YEAR(GETDATE())
            GROUP BY YEAR(p.tgl_terbit)
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
     * Get publikasi statistics by kategori capaian luaran
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of kategori capaian with counts
     */
    public function getPublikasiByKategoriCapaian(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;

        $sql = "
            SELECT
                kc.id_kat_capaian,
                COALESCE(kc.nm_kat_capaian, 'Lainnya') AS kategori,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            LEFT JOIN ref.kategori_capaian_luaran AS kc
                ON kc.id_kat_capaian = p.id_kat_capaian
            WHERE p.soft_delete = 0
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
            GROUP BY kc.id_kat_capaian, kc.nm_kat_capaian
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$startYear, $endYear]);

        return array_map(function ($item) {
            return [
                'kategori' => $item->kategori,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get publikasi statistics by peran (role of author)
     * Only includes publikasi from active Unila dosen
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of peran with counts
     */
    public function getPublikasiByPeran(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 4); // 5 tahun terakhir
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                CASE tp.peran_tulis
                    WHEN 'A' THEN 'Penulis'
                    WHEN 'B' THEN 'Editor'
                    WHEN 'C' THEN 'Penerjemah'
                    WHEN 'D' THEN 'Penemu'
                    ELSE 'Lainnya'
                END as peran,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
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
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            WHERE p.soft_delete = 0
                AND sdm.id_jns_sdm = '12' -- Dosen only
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
            GROUP BY tp.peran_tulis
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function ($item) {
            return [
                'peran' => $item->peran,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get publikasi statistics by fakultas
     * Only includes publikasi from active Unila dosen
     *
     * @param int|null $startYear Start year for filtering (default: current year - 5)
     * @param int|null $endYear End year for filtering (default: current year)
     * @return array Array of fakultas with counts
     */
    public function getPublikasiByFakultas(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 4); // 5 tahun terakhir
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                fak.id_sms,
                fak.nm_lemb AS fakultas,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
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
            -- Join to fakultas (sms lagi menggunakan id_fak_unila)
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms_prodi.id_fak_unila
                AND fak.soft_delete = 0
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
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
