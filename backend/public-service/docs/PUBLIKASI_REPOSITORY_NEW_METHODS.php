<?php

/**
 * NEW METHODS TO ADD TO PublikasiRepository.php
 * Add these two methods at the end of the class (before the closing brace)
 */

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
    $startYear = $startYear ?? ($currentYear - 5);
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
        INNER JOIN ref.prodi AS prodi
            ON prodi.id_prodi = sms.id_prodi
        INNER JOIN ref.jenjang_pendidikan AS jp
            ON jp.id_jenj_didik = prodi.id_jenj_didik
        WHERE p.soft_delete = 0
            AND sdm.id_jns_sdm = '12' -- Dosen only
            AND (jp.nm_jenj_didik LIKE 'D%' OR jp.nm_jenj_didik LIKE 'S%')
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
