<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class DosenRepository
{
    /**
     * Get dosen by jenjang pendidikan (S1, S2, S3)
     * Menggunakan data real dari pdrd.rwy_pend_formal
     *
     * @return array
     */
    public function getDosenByJenjangPendidikan(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END AS jenjang,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            LEFT JOIN (
                SELECT
                    id_sdm,
                    id_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY CAST(id_jenj_didik AS INT) DESC) AS rn
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
            ) AS rwy ON rwy.id_sdm = sdm.id_sdm AND rwy.rn = 1
            LEFT JOIN ref.jenjang_pendidikan AS pend
                ON pend.id_jenj_didik = rwy.id_jenj_didik
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            return [
                'jenjang' => $item->jenjang,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get dosen by jabatan fungsional
     *
     * @return array
     */
    public function getDosenByJabatanFungsional(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            -- Join ke reg_ptk untuk filter dosen aktif
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            -- Join ke keaktifan_ptk untuk filter homebase dan tahun ajaran
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            -- Join ke sms untuk filter prodi aktif
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            -- Join ke jenjang_pendidikan untuk filter hanya D% dan S%
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            -- Left join ke riwayat jabatan fungsional (ambil yang terbaru)
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'  -- Jenis SDM = Dosen
            GROUP BY jabfung.nm_jabfung
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return array_map(function($item) {
            return [
                'jabatan' => $item->jabatan,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get total dosen aktif
     *
     * @return int
     */
    public function getTotalDosen(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT COUNT(DISTINCT ptk.id_sdm) AS total
            FROM pdrd.reg_ptk AS ptk
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            WHERE ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total guru besar (Profesor)
     * Hitung berdasarkan jabatan fungsional 'Profesor' saja
     *
     * @return int
     */
    public function getTotalGuruBesar(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm) AS total
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND jabfung.nm_jabfung = 'Profesor'
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total dosen bergelar doktor (S3)
     * Menggunakan data real dari pdrd.rwy_pend_formal
     *
     * @return int
     */
    public function getTotalDosenDoktor(): int
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm) AS total
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            LEFT JOIN (
                SELECT
                    id_sdm,
                    id_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY CAST(id_jenj_didik AS INT) DESC) AS rn
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
            ) AS rwy ON rwy.id_sdm = sdm.id_sdm AND rwy.rn = 1
            LEFT JOIN ref.jenjang_pendidikan AS pend
                ON pend.id_jenj_didik = rwy.id_jenj_didik
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2')
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        return (int) ($result[0]->total ?? 0);
    }
}
