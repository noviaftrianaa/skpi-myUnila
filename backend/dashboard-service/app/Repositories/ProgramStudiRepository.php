<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ProgramStudiRepository
{
    /**
     * Get active period (semester aktif)
     *
     * @return string
     */
    public function getActivePeriod(): string
    {
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        // If no active period is found, get the latest period (RIGHT 1 < '3' means non-short semester)
        if (empty($result)) {
            $sql = "
                SELECT TOP 1 id_smt
                FROM ref.semester
                WHERE expired_date IS NULL
                    AND RIGHT(id_smt, 1) < '3'
                ORDER BY id_smt DESC
            ";
            $result = DB::connection('sqlsrv')->select($sql);
        }

        return $result[0]->id_smt ?? '20242';
    }

    /**
     * Get available periods (5 years from active period)
     *
     * @return Collection
     */
    public function getAvailablePeriods(): Collection
    {
        $activePeriod = $this->getActivePeriod();
        $activeYear = (int) substr($activePeriod, 0, 4);
        $startYear = $activeYear - 4; // 5 tahun terakhir

        $sql = "
            SELECT
                id_smt,
                nm_smt,
                id_thn_ajaran
            FROM ref.semester
            WHERE expired_date IS NULL
                AND RIGHT(id_smt, 1) < '3'
                AND id_thn_ajaran >= ?
                AND id_thn_ajaran <= ?
            ORDER BY id_smt DESC
        ";

        $results = DB::connection('sqlsrv')->select($sql, [$startYear, $activeYear]);

        return collect($results);
    }

    /**
     * Get program studi list with filters
     *
     * @param array $filters
     * @param string|null $search
     * @param int $offset
     * @param int $limit
     * @param string $sortBy
     * @param string $sortOrder
     * @return Collection
     */
    public function getProgramStudiList(array $filters, ?string $search, int $offset, int $limit, string $sortBy = 'nama', string $sortOrder = 'asc'): Collection
    {
        $periode = $filters['periode'] ?? $this->getActivePeriod();

        $sql = "
            SELECT
                sms.id_sms,
                sms.kode_prodi,
                sms.nm_lemb,
                sms.stat_prodi,
                didik.nm_jenj_didik,
                akred.nm_akred,
                fak.nm_lemb AS nm_fak,
                jur.nm_lemb AS nm_jur,
                ISNULL(dosen.dosen_tetap, 0) AS dosen_tetap,
                ISNULL(dosen.dosen_tidak_tetap, 0) AS dosen_tidak_tetap,
                ISNULL(dosen.dosen_pns, 0) AS dosen_pns,
                ISNULL(dosen.dosen_non_pns, 0) AS dosen_non_pns,
                ISNULL(tendik.total_tendik, 0) AS total_tendik,
                ISNULL(mhs.total_mahasiswa, 0) AS total_mahasiswa,
                ? AS periode
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN pdrd.sms AS jur
                ON jur.id_sms = sms.id_jur_unila
                AND jur.soft_delete = 0
            LEFT JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            LEFT JOIN (
                SELECT
                    ap.id_sms,
                    na.nm_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi AS ap
                JOIN ref.nilai_akred AS na
                    ON na.id_akred = ap.id_akred
                    AND na.expired_date IS NULL
                WHERE ap.soft_delete = 0
                    AND ap.a_aktif = 1
            ) AS akred ON akred.id_sms = sms.id_sms AND akred.rn = 1
            LEFT JOIN (
                SELECT
                    reg.id_sms,
                    COUNT(DISTINCT pd.id_pd) AS total_mahasiswa
                FROM pdrd.kuliah_mhs AS kmh
                JOIN pdrd.reg_pd AS reg
                    ON reg.id_reg_pd = kmh.id_reg_pd
                    AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                    AND pd.id_stat_mhs = 'A'
                WHERE kmh.soft_delete = 0
                    AND kmh.id_stat_mhs = 'A'
                    AND kmh.id_smt = ?
                GROUP BY reg.id_sms
            ) AS mhs ON mhs.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk.id_sms,
                    SUM(CASE WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 1 ELSE 0 END) AS dosen_tetap,
                    SUM(CASE WHEN ptk.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                    SUM(CASE WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_pns,
                    SUM(CASE WHEN ptk.id_stat_pegawai NOT IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_non_pns
                FROM pdrd.reg_ptk AS ptk
                JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = ptk.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '12'
                -- JOIN pdrd.keaktifan_ptk AS ta
                --     ON ta.id_reg_ptk = ptk.id_reg_ptk
                --     AND ta.soft_delete = 0
                --     AND ta.a_sp_homebase = 1
                -- JOIN ref.semester AS smt
                --     ON smt.id_smt = ?
                --     AND smt.expired_date IS NULL
                --     AND ta.id_thn_ajaran = smt.id_thn_ajaran
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                GROUP BY ptk.id_sms
            ) AS dosen ON dosen.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk.id_sms,
                    COUNT(DISTINCT sdm.id_sdm) AS total_tendik
                FROM pdrd.reg_ptk AS ptk
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = ptk.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '13'
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                GROUP BY ptk.id_sms
            ) AS tendik ON tendik.id_sms = sms.id_sms
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
        ";

        $params = [$periode, $periode];

        // Add search filter
        if ($search) {
            $sql .= " AND (sms.nm_lemb LIKE ? OR sms.kode_prodi LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        // Add jenjang filter
        if (!empty($filters['jenjang'])) {
            $sql .= " AND didik.nm_jenj_didik = ?";
            $params[] = $filters['jenjang'];
        }

        // Add akreditasi filter
        if (!empty($filters['akreditasi'])) {
            $sql .= " AND akred.nm_akred = ?";
            $params[] = $filters['akreditasi'];
        }

        // Add fakultas filter
        if (!empty($filters['fakultas'])) {
            $sql .= " AND fak.nm_lemb = ?";
            $params[] = $filters['fakultas'];
        }

        // Map sort fields to actual column names
        $sortMap = [
            'nama' => 'sms.nm_lemb',
            'kode' => 'sms.kode_prodi',
            'jenjang' => 'didik.nm_jenj_didik',
            'akreditasi' => 'akred.nm_akred',
            'fakultas' => 'fak.nm_lemb',
            'total_dosen' => '(ISNULL(dosen.dosen_tetap, 0) + ISNULL(dosen.dosen_tidak_tetap, 0))',
            'total_mahasiswa' => 'ISNULL(mhs.total_mahasiswa, 0)',
            'total_tendik' => 'ISNULL(tendik.total_tendik, 0)',
        ];

        $sortColumn = $sortMap[$sortBy] ?? 'sms.nm_lemb';
        $sortDirection = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

        $sql .= " ORDER BY {$sortColumn} {$sortDirection} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $params[] = $offset;
        $params[] = $limit;

        $results = DB::connection('sqlsrv')->select($sql, $params);

        return collect($results);
    }

    /**
     * Get total count of program studi
     *
     * @param array $filters
     * @param string|null $search
     * @return int
     */
    public function countProgramStudi(array $filters, ?string $search): int
    {
        $periode = $filters['periode'] ?? $this->getActivePeriod();

        $sql = "
            SELECT COUNT(*) AS total
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            LEFT JOIN (
                SELECT
                    ap.id_sms,
                    na.nm_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi AS ap
                JOIN ref.nilai_akred AS na
                    ON na.id_akred = ap.id_akred
                    AND na.expired_date IS NULL
                WHERE ap.soft_delete = 0
                    AND ap.a_aktif = 1
            ) AS akred ON akred.id_sms = sms.id_sms AND akred.rn = 1
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
        ";

        $params = [];

        // Add search filter
        if ($search) {
            $sql .= " AND (sms.nm_lemb LIKE ? OR sms.kode_prodi LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        // Add jenjang filter
        if (!empty($filters['jenjang'])) {
            $sql .= " AND didik.nm_jenj_didik = ?";
            $params[] = $filters['jenjang'];
        }

        // Add akreditasi filter
        if (!empty($filters['akreditasi'])) {
            $sql .= " AND akred.nm_akred = ?";
            $params[] = $filters['akreditasi'];
        }

        // Add fakultas filter
        if (!empty($filters['fakultas'])) {
            $sql .= " AND fak.nm_lemb = ?";
            $params[] = $filters['fakultas'];
        }

        $result = DB::connection('sqlsrv')->select($sql, $params);

        return (int) $result[0]->total;
    }

    /**
     * Get statistics for program studi
     *
     * @param array $filters
     * @return object
     */
    public function getStatistics(array $filters): object
    {
        $periode = $filters['periode'] ?? $this->getActivePeriod();

        $sql = "
            SELECT
                COUNT(*) AS total_prodi,
                SUM(ISNULL(dosen.dosen_tetap, 0) + ISNULL(dosen.dosen_tidak_tetap, 0)) AS total_dosen,
                SUM(ISNULL(tendik.total_tendik, 0)) AS total_tendik,
                SUM(ISNULL(mhs.total_mahasiswa, 0)) AS total_mahasiswa,
                SUM(CASE WHEN akred.nm_akred = 'Unggul' THEN 1 ELSE 0 END) AS akred_unggul,
                SUM(CASE WHEN akred.nm_akred = 'Baik Sekali' THEN 1 ELSE 0 END) AS akred_baik_sekali,
                SUM(CASE WHEN akred.nm_akred = 'Baik' THEN 1 ELSE 0 END) AS akred_baik,
                SUM(CASE WHEN akred.nm_akred = 'A' THEN 1 ELSE 0 END) AS akred_a,
                SUM(CASE WHEN akred.nm_akred = 'B' THEN 1 ELSE 0 END) AS akred_b,
                SUM(CASE WHEN akred.nm_akred = 'C' THEN 1 ELSE 0 END) AS akred_c,
                SUM(CASE WHEN akred.nm_akred = 'Tidak Terakreditasi' THEN 1 ELSE 0 END) AS akred_tidak_terakreditasi,
                SUM(CASE WHEN akred.nm_akred = 'Belum Terakreditasi' OR akred.nm_akred IS NULL THEN 1 ELSE 0 END) AS akred_belum_terakreditasi,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S3' THEN 1 ELSE 0 END) AS jenjang_s3,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S2' THEN 1 ELSE 0 END) AS jenjang_s2,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S1' THEN 1 ELSE 0 END) AS jenjang_s1,
                SUM(CASE WHEN didik.nm_jenj_didik = 'D4' THEN 1 ELSE 0 END) AS jenjang_d4,
                SUM(CASE WHEN didik.nm_jenj_didik = 'D3' THEN 1 ELSE 0 END) AS jenjang_d3
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    ap.id_sms,
                    na.nm_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi AS ap
                JOIN ref.nilai_akred AS na
                    ON na.id_akred = ap.id_akred
                    AND na.expired_date IS NULL
                WHERE ap.soft_delete = 0
                    AND ap.a_aktif = 1
            ) AS akred ON akred.id_sms = sms.id_sms AND akred.rn = 1
            LEFT JOIN (
                SELECT
                    reg.id_sms,
                    COUNT(DISTINCT pd.id_pd) AS total_mahasiswa
                FROM pdrd.kuliah_mhs AS kmh
                JOIN pdrd.reg_pd AS reg
                    ON reg.id_reg_pd = kmh.id_reg_pd
                    AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                    AND pd.id_stat_mhs = 'A'
                WHERE kmh.soft_delete = 0
                    AND kmh.id_stat_mhs = 'A'
                    AND kmh.id_smt = ?
                GROUP BY reg.id_sms
            ) AS mhs ON mhs.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk.id_sms,
                    SUM(CASE WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 1 ELSE 0 END) AS dosen_tetap,
                    SUM(CASE WHEN ptk.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                    SUM(CASE WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_pns,
                    SUM(CASE WHEN ptk.id_stat_pegawai NOT IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_non_pns
                FROM pdrd.reg_ptk AS ptk
                JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = ptk.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '12'
                -- JOIN pdrd.keaktifan_ptk AS ta
                --     ON ta.id_reg_ptk = ptk.id_reg_ptk
                --     AND ta.soft_delete = 0
                --     AND ta.a_sp_homebase = 1
                -- JOIN ref.semester AS smt
                --     ON smt.id_smt = ?
                --     AND smt.expired_date IS NULL
                --     AND ta.id_thn_ajaran = smt.id_thn_ajaran
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                GROUP BY ptk.id_sms
            ) AS dosen ON dosen.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk.id_sms,
                    COUNT(DISTINCT sdm.id_sdm) AS total_tendik
                FROM pdrd.reg_ptk AS ptk
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = ptk.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '13'
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                GROUP BY ptk.id_sms
            ) AS tendik ON tendik.id_sms = sms.id_sms
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
        ";

        $params = [$periode];

        // Add jenjang filter
        if (!empty($filters['jenjang'])) {
            $sql .= " AND didik.nm_jenj_didik = ?";
            $params[] = $filters['jenjang'];
        }

        // Add akreditasi filter
        if (!empty($filters['akreditasi'])) {
            $sql .= " AND akred.nm_akred = ?";
            $params[] = $filters['akreditasi'];
        }

        $result = DB::connection('sqlsrv')->select($sql, $params);

        return $result[0];
    }

    /**
     * Get filter options (fakultas, jenjang, akreditasi)
     *
     * @return array
     */
    public function getFilterOptions(): array
    {
        // Get fakultas list
        $sqlFakultas = "
            SELECT DISTINCT nm_lemb
            FROM pdrd.sms
            WHERE soft_delete = 0
                AND id_jenj_didik = 9
            ORDER BY nm_lemb
        ";

        $fakultas = DB::connection('sqlsrv')->select($sqlFakultas);

        // Get jenjang list
        $sqlJenjang = "
            SELECT id_jenj_didik, nm_jenj_didik
            FROM ref.jenjang_pendidikan
            WHERE expired_date IS NULL
                AND (nm_jenj_didik LIKE 'D%' OR nm_jenj_didik LIKE 'S%')
            ORDER BY id_jenj_didik
        ";

        $jenjang = DB::connection('sqlsrv')->select($sqlJenjang);

        // Get akreditasi list
        $sqlAkreditasi = "
            SELECT id_akred, nm_akred
            FROM ref.nilai_akred
            WHERE expired_date IS NULL
            ORDER BY id_akred DESC
        ";

        $akreditasi = DB::connection('sqlsrv')->select($sqlAkreditasi);

        return [
            'fakultas' => array_column($fakultas, 'nm_lemb'),
            'jenjang' => array_column($jenjang, 'nm_jenj_didik'),
            'akreditasi' => array_column($akreditasi, 'nm_akred'),
        ];
    }
}
