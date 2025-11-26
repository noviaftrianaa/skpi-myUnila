<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use App\Helpers\TahunAjaranHelper;

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
                id_thn_ajaran,
                a_periode_aktif
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
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

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
                -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE kmh.soft_delete = 0
                    AND kmh.id_stat_mhs = 'A'
                    AND kmh.id_smt = ?
                GROUP BY reg.id_sms
            ) AS mhs ON mhs.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk_filtered.id_sms,
                    SUM(CASE WHEN ptk_filtered.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 1 ELSE 0 END) AS dosen_tetap,
                    SUM(CASE WHEN ptk_filtered.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                    SUM(CASE WHEN ptk_filtered.id_stat_pegawai IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_pns,
                    SUM(CASE WHEN ptk_filtered.id_stat_pegawai NOT IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_non_pns
                FROM (
                    SELECT
                        ptk.id_sms,
                        ptk.id_sdm,
                        ptk.id_ikatan_kerja,
                        ptk.id_stat_pegawai,
                        ROW_NUMBER() OVER (PARTITION BY ptk.id_sdm, ptk.id_sms ORDER BY ptk.create_date DESC, ptk.id_reg_ptk DESC) AS rn
                    FROM pdrd.reg_ptk AS ptk
                    JOIN pdrd.sdm AS sdm
                        ON sdm.id_sdm = ptk.id_sdm
                        AND sdm.soft_delete = 0
                        AND sdm.id_jns_sdm = '12'
                    JOIN pdrd.keaktifan_ptk AS keaktifan
                        ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                        AND keaktifan.soft_delete = 0
                        AND keaktifan.a_sp_homebase = 1
                        AND keaktifan.id_thn_ajaran = ?
                    WHERE ptk.soft_delete = 0
                        AND ptk.id_jns_keluar IS NULL
                        AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                ) AS ptk_filtered
                WHERE ptk_filtered.rn = 1
                GROUP BY ptk_filtered.id_sms
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
                AND sms.id_fak_unila IS NOT NULL
                AND sms.id_jns_sms = '3'
        ";

        $params = [$periode, $periode, $tahunAjaran];

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
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                AND sms.id_fak_unila IS NOT NULL
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
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        // Build filter WHERE clause
        $filterWhere = "";
        $filterParams = [];

        if (!empty($filters['jenjang'])) {
            $filterWhere .= " AND didik.nm_jenj_didik = ?";
            $filterParams[] = $filters['jenjang'];
        }

        if (!empty($filters['akreditasi'])) {
            $filterWhere .= " AND akred.nm_akred = ?";
            $filterParams[] = $filters['akreditasi'];
        }

        // Get total prodi
        $sqlProdi = "
            SELECT COUNT(*) AS total
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
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '{$unilaIdSp}'
                AND sms.id_fak_unila IS NOT NULL
                {$filterWhere}
        ";

        // Get total dosen DISTINCT (avoid double count)
        // Filter konsisten dengan sqlProdi: id_jns_sms = '3', id_fak_unila IS NOT NULL
        $sqlDosen = "
            SELECT COUNT(DISTINCT ptk.id_sdm) AS total
            FROM pdrd.reg_ptk AS ptk
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
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
            WHERE ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = '{$unilaIdSp}'
                {$filterWhere}
        ";

        // Get total mahasiswa DISTINCT
        // Filter konsisten dengan sqlProdi: id_jns_sms = '3', id_fak_unila IS NOT NULL, UNILA_ID_SP
        $sqlMahasiswa = "
            SELECT COUNT(DISTINCT pd.id_pd) AS total
            FROM pdrd.kuliah_mhs AS kmh
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
                AND CAST(sms.id_sp AS VARCHAR(50)) = '{$unilaIdSp}'
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
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
                {$filterWhere}
        ";

        // Get akreditasi and jenjang breakdown
        $sqlBreakdown = "
            SELECT
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
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = '{$unilaIdSp}'
                AND sms.id_fak_unila IS NOT NULL
                {$filterWhere}
        ";

        // Execute queries
        $totalProdi = DB::connection('sqlsrv')->select($sqlProdi, $filterParams);
        $totalDosen = DB::connection('sqlsrv')->select($sqlDosen, array_merge([$tahunAjaran], $filterParams));
        $totalMahasiswa = DB::connection('sqlsrv')->select($sqlMahasiswa, array_merge([$periode], $filterParams));
        $breakdown = DB::connection('sqlsrv')->select($sqlBreakdown, $filterParams);

        // Combine results
        return (object) [
            'total_prodi' => (int) ($totalProdi[0]->total ?? 0),
            'total_dosen' => (int) ($totalDosen[0]->total ?? 0),
            'total_tendik' => 0, // Will be calculated separately if needed
            'total_mahasiswa' => (int) ($totalMahasiswa[0]->total ?? 0),
            'akred_unggul' => (int) ($breakdown[0]->akred_unggul ?? 0),
            'akred_baik_sekali' => (int) ($breakdown[0]->akred_baik_sekali ?? 0),
            'akred_baik' => (int) ($breakdown[0]->akred_baik ?? 0),
            'akred_a' => (int) ($breakdown[0]->akred_a ?? 0),
            'akred_b' => (int) ($breakdown[0]->akred_b ?? 0),
            'akred_c' => (int) ($breakdown[0]->akred_c ?? 0),
            'akred_tidak_terakreditasi' => (int) ($breakdown[0]->akred_tidak_terakreditasi ?? 0),
            'akred_belum_terakreditasi' => (int) ($breakdown[0]->akred_belum_terakreditasi ?? 0),
            'jenjang_s3' => (int) ($breakdown[0]->jenjang_s3 ?? 0),
            'jenjang_s2' => (int) ($breakdown[0]->jenjang_s2 ?? 0),
            'jenjang_s1' => (int) ($breakdown[0]->jenjang_s1 ?? 0),
            'jenjang_d4' => (int) ($breakdown[0]->jenjang_d4 ?? 0),
            'jenjang_d3' => (int) ($breakdown[0]->jenjang_d3 ?? 0),
        ];
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

    /**
     * Get program studi detail by ID
     *
     * @param string $idSms
     * @param string|null $periode
     * @return object|null
     */
    public function getProgramStudiDetail(string $idSms, ?string $periode = null): ?object
    {
        $periode = $periode ?? $this->getActivePeriod();
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                sms.id_sms,
                sms.kode_prodi,
                sms.nm_lemb AS nama_prodi,
                sms.stat_prodi,
                sms.tgl_berdiri,
                sms.sk_selenggara,
                sms.website,
                sms.email,
                sms.no_tel,
                sms.no_fax,
                didik.nm_jenj_didik AS jenjang,
                akred.nm_akred AS akreditasi,
                fak.nm_lemb AS fakultas,
                fak.id_sms AS id_fakultas,
                jur.nm_lemb AS jurusan,
                jur.id_sms AS id_jurusan,
                ISNULL(dosen.dosen_tetap, 0) AS dosen_tetap,
                ISNULL(dosen.dosen_tidak_tetap, 0) AS dosen_tidak_tetap,
                ISNULL(dosen.dosen_pns, 0) AS dosen_pns,
                ISNULL(dosen.dosen_non_pns, 0) AS dosen_non_pns,
                ISNULL(tendik.total_tendik, 0) AS total_tendik,
                ISNULL(mhs.total_mahasiswa, 0) AS total_mahasiswa,
                pp.visi,
                pp.misi,
                pp.tujuan,
                pp.sasaran,
                pp.kompetensi,
                pp.capaian_belajar,
                pp.desk_singkat,
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
                    pp_sub.id_sms,
                    pp_sub.visi,
                    pp_sub.misi,
                    pp_sub.tujuan,
                    pp_sub.sasaran,
                    pp_sub.kompetensi,
                    pp_sub.capaian_belajar,
                    pp_sub.desk_singkat,
                    ROW_NUMBER() OVER (PARTITION BY pp_sub.id_sms ORDER BY pp_sub.id_thn_ajaran DESC) AS rn
                FROM pdrd.profil_prodi AS pp_sub
                WHERE pp_sub.soft_delete = 0
            ) AS pp ON pp.id_sms = sms.id_sms AND pp.rn = 1
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
                -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE kmh.soft_delete = 0
                    AND kmh.id_stat_mhs = 'A'
                    AND kmh.id_smt = ?
                GROUP BY reg.id_sms
            ) AS mhs ON mhs.id_sms = sms.id_sms
            LEFT JOIN (
                SELECT
                    ptk_filtered.id_sms,
                    SUM(CASE WHEN ptk_filtered.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 1 ELSE 0 END) AS dosen_tetap,
                    SUM(CASE WHEN ptk_filtered.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                    SUM(CASE WHEN ptk_filtered.id_stat_pegawai IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_pns,
                    SUM(CASE WHEN ptk_filtered.id_stat_pegawai NOT IN ('1','13','14') THEN 1 ELSE 0 END) AS dosen_non_pns
                FROM (
                    SELECT
                        ptk.id_sms,
                        ptk.id_sdm,
                        ptk.id_ikatan_kerja,
                        ptk.id_stat_pegawai,
                        ROW_NUMBER() OVER (PARTITION BY ptk.id_sdm, ptk.id_sms ORDER BY ptk.create_date DESC, ptk.id_reg_ptk DESC) AS rn
                    FROM pdrd.reg_ptk AS ptk
                    JOIN pdrd.sdm AS sdm
                        ON sdm.id_sdm = ptk.id_sdm
                        AND sdm.soft_delete = 0
                        AND sdm.id_jns_sdm = '12'
                    JOIN pdrd.keaktifan_ptk AS keaktifan
                        ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                        AND keaktifan.soft_delete = 0
                        AND keaktifan.a_sp_homebase = 1
                        AND keaktifan.id_thn_ajaran = ?
                    WHERE ptk.soft_delete = 0
                        AND ptk.id_jns_keluar IS NULL
                        AND ptk.id_sms = ?
                        AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
                ) AS ptk_filtered
                WHERE ptk_filtered.rn = 1
                GROUP BY ptk_filtered.id_sms
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
            WHERE sms.id_sms = ?
                AND sms.soft_delete = 0
                AND CAST(sms.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
        ";

        $params = [$periode, $periode, $tahunAjaran, $idSms, $idSms];
        $results = DB::connection('sqlsrv')->select($sql, $params);

        return $results[0] ?? null;
    }

    /**
     * Get daftar dosen by program studi (homebase)
     *
     * @param string $idSms
     * @return Collection
     */
    public function getDosenByProgramStudi(string $idSms): Collection
    {
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                -- Build full name with gelar
                LTRIM(RTRIM(
                    ISNULL((
                        SELECT STUFF((
                            SELECT '. ' + ga.singkat_gelar
                            FROM pdrd.rwy_pend_formal AS rpf
                            LEFT JOIN ref.gelar_akademik AS ga
                                ON ga.id_gelar_akad = rpf.id_gelar_akad
                            LEFT JOIN ref.jenjang_pendidikan AS jenj
                                ON jenj.id_jenj_didik = rpf.id_jenj_didik
                                AND jenj.expired_date IS NULL
                            WHERE rpf.id_sdm = sdm.id_sdm
                                AND rpf.soft_delete = 0
                                AND rpf.thn_lulus IS NOT NULL
                                AND ga.singkat_gelar IS NOT NULL
                                AND ga.posisi_gelar = 1
                            ORDER BY
                                CASE
                                    WHEN jenj.nm_jenj_didik LIKE 'D%' THEN 1
                                    WHEN jenj.nm_jenj_didik LIKE 'S1%' THEN 2
                                    WHEN jenj.nm_jenj_didik LIKE 'S2%' THEN 3
                                    WHEN jenj.nm_jenj_didik LIKE 'S3%' THEN 4
                                    ELSE 5
                                END,
                                rpf.thn_lulus
                            FOR XML PATH(''), TYPE
                        ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') + '. '
                    ), '') +
                    sdm.nm_sdm +
                    ISNULL((
                        SELECT ', ' + STUFF((
                            SELECT ', ' + ga.singkat_gelar
                            FROM pdrd.rwy_pend_formal AS rpf
                            LEFT JOIN ref.gelar_akademik AS ga
                                ON ga.id_gelar_akad = rpf.id_gelar_akad
                            LEFT JOIN ref.jenjang_pendidikan AS jenj
                                ON jenj.id_jenj_didik = rpf.id_jenj_didik
                                AND jenj.expired_date IS NULL
                            WHERE rpf.id_sdm = sdm.id_sdm
                                AND rpf.soft_delete = 0
                                AND rpf.thn_lulus IS NOT NULL
                                AND ga.singkat_gelar IS NOT NULL
                                AND ga.posisi_gelar = 2
                            ORDER BY
                                CASE
                                    WHEN jenj.nm_jenj_didik LIKE 'D%' THEN 1
                                    WHEN jenj.nm_jenj_didik LIKE 'S1%' THEN 2
                                    WHEN jenj.nm_jenj_didik LIKE 'S2%' THEN 3
                                    WHEN jenj.nm_jenj_didik LIKE 'S3%' THEN 4
                                    ELSE 5
                                END,
                                rpf.thn_lulus
                            FOR XML PATH(''), TYPE
                        ).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
                    ), '')
                )) AS nama_lengkap,
                sdm.nidn,
                ISNULL(sdm.nuptk, '-') AS nuptk,
                CASE
                    WHEN sdm.jk = 'L' THEN 'Laki-laki'
                    WHEN sdm.jk = 'P' THEN 'Perempuan'
                    ELSE 'Tidak Diketahui'
                END AS jenis_kelamin,
                ISNULL(ptk.id_ikatan_kerja, '-') AS id_ikatan_kerja,
                CASE
                    WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 'Dosen Tetap'
                    WHEN ptk.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
                    ELSE 'Lainnya'
                END AS ikatan_kerja,
                ISNULL(ptk.id_stat_pegawai, '-') AS id_stat_pegawai,
                CASE
                    WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 'PNS'
                    ELSE 'Non-PNS'
                END AS status_kepegawaian,
                ISNULL(jabfung_terakhir.nm_jabfung, '-') AS jabatan_fungsional,
                ISNULL(pend_terakhir.nm_jenj_didik, '-') AS pendidikan_terakhir,
                ISNULL(sdm.id_stat_aktif, 1) AS id_stat_aktif,
                ISNULL(stat_aktif.nm_stat_aktif, 'Aktif') AS status_keaktifan
            FROM (
                SELECT
                    ptk.*,
                    ROW_NUMBER() OVER (PARTITION BY ptk.id_sdm ORDER BY ptk.create_date DESC, ptk.id_reg_ptk DESC) AS rn
                FROM pdrd.reg_ptk AS ptk
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                    ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                    AND keaktifan.soft_delete = 0
                    AND keaktifan.a_sp_homebase = 1
                    AND keaktifan.id_thn_ajaran = ?
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND ptk.id_sms = ?
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
            ) AS ptk
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            LEFT JOIN ref.status_keaktifan_pegawai AS stat_aktif
                ON stat_aktif.id_stat_aktif = sdm.id_stat_aktif
                AND stat_aktif.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rf.id_sdm,
                    jf.nm_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rf
                LEFT JOIN ref.jabfung AS jf
                    ON jf.id_jabfung = rf.id_jabfung
                    AND jf.expired_date IS NULL
                WHERE rf.soft_delete = 0
            ) AS jabfung_terakhir
                ON jabfung_terakhir.id_sdm = sdm.id_sdm
                AND jabfung_terakhir.rn = 1
            LEFT JOIN (
                SELECT
                    rp.id_sdm,
                    jd.nm_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY rp.id_sdm ORDER BY rp.thn_lulus DESC) AS rn
                FROM pdrd.rwy_pend_formal AS rp
                LEFT JOIN ref.jenjang_pendidikan AS jd
                    ON jd.id_jenj_didik = rp.id_jenj_didik
                    AND jd.expired_date IS NULL
                WHERE rp.soft_delete = 0
            ) AS pend_terakhir
                ON pend_terakhir.id_sdm = sdm.id_sdm
                AND pend_terakhir.rn = 1
            WHERE ptk.rn = 1
            ORDER BY sdm.nm_sdm ASC
        ";

        $results = DB::connection('sqlsrv')->select($sql, [$tahunAjaran, $idSms]);

        return collect($results);
    }

    /**
     * Get mahasiswa trend for 5 latest semesters by program studi
     *
     * @param string $idSms
     * @return Collection
     */
    public function getMahasiswaTrendByProgramStudi(string $idSms): Collection
    {
        $sql = "
            SELECT TOP 5
                kmh.id_smt AS semester,
                smt.nm_smt AS nama_semester,
                COUNT(DISTINCT pd.id_pd) AS total_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
                AND reg.id_sms = ?
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            JOIN ref.semester AS smt
                ON smt.id_smt = kmh.id_smt
                AND smt.expired_date IS NULL
                AND RIGHT(smt.id_smt, 1) < '3'
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND CAST(reg.id_sp AS VARCHAR(50)) = '" . strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')) . "'
            GROUP BY kmh.id_smt, smt.nm_smt
            ORDER BY kmh.id_smt DESC
        ";

        $results = DB::connection('sqlsrv')->select($sql, [$idSms]);

        return collect($results);
    }

    /**
     * Get kurikulum by program studi
     *
     * @param string $idSms
     * @return Collection
     */
    public function getKurikulumByProgramStudi(string $idSms): Collection
    {
        $sql = "
            SELECT
                k.*,
                jd.nm_jenj_didik AS jenjang,
                smt.nm_smt AS semester,
                sms.nm_lemb AS nama_prodi
            FROM pdrd.kurikulum_sp AS k
            INNER JOIN ref.jenjang_pendidikan AS jd
                ON jd.id_jenj_didik = k.id_jenj_didik
                AND jd.expired_date IS NULL
            INNER JOIN ref.semester AS smt
                ON smt.id_smt = k.id_smt
                AND smt.expired_date IS NULL
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = k.id_sms
                AND sms.soft_delete = 0
            WHERE k.soft_delete = 0
                AND k.id_sms = ?
            ORDER BY k.id_smt DESC
        ";

        $results = DB::connection('sqlsrv')->select($sql, [$idSms]);

        return collect($results);
    }

    /**
     * Get mata kuliah by kurikulum (grouped by semester)
     *
     * @param string $idKurikulum
     * @return Collection
     */
    public function getMataKuliahByKurikulum(string $idKurikulum): Collection
    {
        $sql = "
            SELECT
                mk_kur.id_kurikulum_sp,
                mk_kur.id_mk,
                mk_kur.smt AS semester_ke,
                mk_kur.sks_mk,
                mk_kur.sks_tm,
                mk_kur.sks_prak,
                mk_kur.sks_prak_lap,
                mk_kur.sks_sim,
                mk_kur.a_wajib,
                mk.kode_mk,
                mk.nm_mk AS nama_matkul,
                CASE
                    WHEN mk_kur.a_wajib = 1 THEN 'Wajib'
                    ELSE 'Pilihan'
                END AS status_wajib
            FROM pdrd.matkul_kurikulum AS mk_kur
            INNER JOIN pdrd.matkul AS mk
                ON mk.id_mk = mk_kur.id_mk
                AND mk.soft_delete = 0
            WHERE mk_kur.soft_delete = 0
                AND mk_kur.id_kurikulum_sp = ?
            ORDER BY mk_kur.smt ASC, mk_kur.a_wajib DESC, mk.nm_mk ASC
        ";

        $results = DB::connection('sqlsrv')->select($sql, [$idKurikulum]);

        return collect($results);
    }

    /**
     * Get tracer study data for a program studi
     *
     * @param string $idSms
     * @return object
     */
    public function getTracerStudyData(string $idSms): object
    {
        // Get total alumni and basic stats
        $sqlStats = "
            SELECT
                COUNT(*) AS total_alumni,
                AVG(CASE WHEN wkt_tunggu IS NOT NULL THEN CAST(wkt_tunggu AS FLOAT) ELSE NULL END) AS avg_waktu_tunggu,
                AVG(CASE WHEN income_per_bln IS NOT NULL AND income_per_bln >= 100000 AND income_per_bln <= 50000000 THEN CAST(income_per_bln AS FLOAT) ELSE NULL END) AS avg_income,
                SUM(CASE WHEN a_kerja_sblm_lulus = 1 THEN 1 ELSE 0 END) AS bekerja_sebelum_lulus,
                SUM(CASE WHEN status_lulusan = 1 THEN 1 ELSE 0 END) AS status_bekerja,
                SUM(CASE WHEN status_lulusan = 2 THEN 1 ELSE 0 END) AS status_wiraswasta,
                SUM(CASE WHEN status_lulusan = 3 THEN 1 ELSE 0 END) AS status_kuliah_lanjut,
                SUM(CASE WHEN status_lulusan = 4 THEN 1 ELSE 0 END) AS status_belum_bekerja
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            WHERE hts.soft_delete = 0
                AND reg.id_sms = ?
        ";

        // Get kesesuaian bidang kerja distribution
        $sqlKesesuaian = "
            SELECT
                hub_bidang_kerja,
                COUNT(*) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            WHERE hts.soft_delete = 0
                AND reg.id_sms = ?
                AND hts.hub_bidang_kerja IS NOT NULL
            GROUP BY hub_bidang_kerja
            ORDER BY hub_bidang_kerja
        ";

        // Get level perusahaan distribution
        $sqlLevelPerusahaan = "
            SELECT
                level_perusahaan,
                COUNT(*) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            WHERE hts.soft_delete = 0
                AND reg.id_sms = ?
                AND hts.level_perusahaan IS NOT NULL
            GROUP BY level_perusahaan
        ";

        // Get waktu tunggu distribution by year
        $sqlWaktuTungguTrend = "
            SELECT TOP 5
                id_thn_ajaran,
                AVG(CASE WHEN wkt_tunggu IS NOT NULL THEN CAST(wkt_tunggu AS FLOAT) ELSE NULL END) AS avg_waktu_tunggu,
                COUNT(*) AS jumlah
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            WHERE hts.soft_delete = 0
                AND reg.id_sms = ?
                AND hts.wkt_tunggu IS NOT NULL
            GROUP BY id_thn_ajaran
            ORDER BY id_thn_ajaran DESC
        ";

        // Execute queries
        $stats = DB::connection('sqlsrv')->select($sqlStats, [$idSms]);
        $kesesuaian = DB::connection('sqlsrv')->select($sqlKesesuaian, [$idSms]);
        $levelPerusahaan = DB::connection('sqlsrv')->select($sqlLevelPerusahaan, [$idSms]);
        $waktuTungguTrend = DB::connection('sqlsrv')->select($sqlWaktuTungguTrend, [$idSms]);

        $statsData = $stats[0] ?? null;

        return (object) [
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
            'kesesuaian_bidang' => array_map(function ($item) {
                $labels = [
                    1 => 'Sangat Sesuai',
                    2 => 'Sesuai',
                    3 => 'Cukup Sesuai',
                    4 => 'Tidak Sesuai',
                ];
                return [
                    'tingkat' => (int) $item->hub_bidang_kerja,
                    'label' => $labels[$item->hub_bidang_kerja] ?? 'Tidak Diketahui',
                    'jumlah' => (int) $item->jumlah,
                ];
            }, $kesesuaian),
            'level_perusahaan' => array_map(function ($item) {
                return [
                    'level' => $item->level_perusahaan,
                    'jumlah' => (int) $item->jumlah,
                ];
            }, $levelPerusahaan),
            'waktu_tunggu_trend' => array_map(function ($item) {
                return [
                    'tahun' => (int) $item->id_thn_ajaran,
                    'avg_waktu_tunggu' => round((float) $item->avg_waktu_tunggu, 1),
                    'jumlah' => (int) $item->jumlah,
                ];
            }, $waktuTungguTrend),
        ];
    }

    /**
     * Get riwayat akreditasi for a program studi
     *
     * @param string $id_sms
     * @return array
     */
    public function getRiwayatAkreditasi(string $id_sms): array
    {
        \Log::info('=== getRiwayatAkreditasi START ===', [
            'id_sms' => $id_sms,
            'id_sms_type' => gettype($id_sms),
            'id_sms_length' => strlen($id_sms),
        ]);

        // Use native query for better reliability with SQL Server
        $sql = "
            SELECT
                na.nm_akred as peringkat,
                ap.sk_akreditasi_prodi as no_sk,
                ap.tanggal_sk_akreditasi_prodi as tanggal_sk,
                ap.tst_sk_akreditasi_prodi as tanggal_berakhir,
                la.nm_lemb as lembaga_akreditasi
            FROM pdrd.akreditasi_prodi ap
            LEFT JOIN ref.nilai_akred na ON ap.id_akred = na.id_akred
            LEFT JOIN ref.lembaga_akred la ON ap.id_lemb_akred = la.id_lemb_akred
            WHERE ap.id_sms = ?
                AND ap.soft_delete = 0
            ORDER BY ap.tanggal_sk_akreditasi_prodi DESC
        ";

        \Log::info('Executing SQL query', [
            'sql' => $sql,
            'params' => [$id_sms]
        ]);

        try {
            $data = DB::connection('sqlsrv')->select($sql, [$id_sms]);

            \Log::info('Query executed successfully', [
                'result_count' => count($data),
                'raw_data' => $data
            ]);
        } catch (\Exception $e) {
            \Log::error('Query execution failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }

        $result = array_map(function ($item) {
            return [
                'peringkat' => $item->peringkat ?? '-',
                'no_sk' => $item->no_sk ?? '-',
                'tanggal_sk' => $item->tanggal_sk ? (is_string($item->tanggal_sk) ? $item->tanggal_sk : date('Y-m-d', strtotime($item->tanggal_sk))) : null,
                'tanggal_berakhir' => $item->tanggal_berakhir ? (is_string($item->tanggal_berakhir) ? $item->tanggal_berakhir : date('Y-m-d', strtotime($item->tanggal_berakhir))) : null,
                'lembaga_akreditasi' => $item->lembaga_akreditasi ?? 'BAN-PT',
            ];
        }, $data);

        \Log::info('=== getRiwayatAkreditasi END ===', [
            'final_result_count' => count($result),
            'final_result' => $result
        ]);

        return $result;
    }

    /**
     * Get sebaran program studi per fakultas with jenjang breakdown
     *
     * @param string|null $periode
     * @return array
     */
    public function getSebaranFakultas(?string $periode = null): array
    {
        $periode = $periode ?? $this->getActivePeriod();
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        // Query sebaran program studi per fakultas with jenjang breakdown
        $sql = "
            SELECT
                fak.id_sms AS id,
                fak.nm_lemb AS nama,
                COUNT(DISTINCT sms.id_sms) AS total_prodi,
                SUM(CASE WHEN didik.nm_jenj_didik = 'D3' THEN 1 ELSE 0 END) AS jenjang_d3,
                SUM(CASE WHEN didik.nm_jenj_didik = 'D4' THEN 1 ELSE 0 END) AS jenjang_d4,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S1' THEN 1 ELSE 0 END) AS jenjang_s1,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S2' THEN 1 ELSE 0 END) AS jenjang_s2,
                SUM(CASE WHEN didik.nm_jenj_didik = 'S3' THEN 1 ELSE 0 END) AS jenjang_s3,
                SUM(CASE WHEN didik.nm_jenj_didik = 'Profesi' THEN 1 ELSE 0 END) AS jenjang_profesi,
                SUM(CASE WHEN didik.nm_jenj_didik = 'Sp-1' THEN 1 ELSE 0 END) AS jenjang_sp1,
                SUM(CASE WHEN didik.nm_jenj_didik = 'Sp-2' THEN 1 ELSE 0 END) AS jenjang_sp2
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
                AND sms.id_fak_unila IS NOT NULL
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY total_prodi DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

        $fakultas = array_map(function($item) {
            // Build jenjang_counts array in the format frontend expects
            $jenjangCounts = [];
            $jenjangData = [
                'D3' => (int) ($item->jenjang_d3 ?? 0),
                'D4' => (int) ($item->jenjang_d4 ?? 0),
                'S1' => (int) ($item->jenjang_s1 ?? 0),
                'S2' => (int) ($item->jenjang_s2 ?? 0),
                'S3' => (int) ($item->jenjang_s3 ?? 0),
                'Profesi' => (int) ($item->jenjang_profesi ?? 0),
                'Sp-1' => (int) ($item->jenjang_sp1 ?? 0),
                'Sp-2' => (int) ($item->jenjang_sp2 ?? 0),
            ];

            foreach ($jenjangData as $jenjang => $jumlah) {
                if ($jumlah > 0) {
                    $jenjangCounts[] = [
                        'jenjang' => $jenjang,
                        'jumlah' => $jumlah,
                    ];
                }
            }

            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'total_prodi' => (int) $item->total_prodi,
                'jenjang_counts' => $jenjangCounts,
            ];
        }, $result);

        // Calculate statistics
        $totalProdi = array_sum(array_column($fakultas, 'total_prodi'));
        $totalFakultas = count($fakultas);

        $jenjangTotals = [
            'D3' => 0,
            'D4' => 0,
            'S1' => 0,
            'S2' => 0,
            'S3' => 0,
            'Profesi' => 0,
            'Sp-1' => 0,
            'Sp-2' => 0,
        ];

        foreach ($fakultas as $fak) {
            foreach ($fak['jenjang_counts'] as $jc) {
                $jenjangTotals[$jc['jenjang']] += $jc['jumlah'];
            }
        }

        return [
            'fakultas' => $fakultas,
            'statistics' => [
                'total_fakultas' => $totalFakultas,
                'total_prodi' => $totalProdi,
                'total_d3' => $jenjangTotals['D3'],
                'total_d4' => $jenjangTotals['D4'],
                'total_s1' => $jenjangTotals['S1'],
                'total_s2' => $jenjangTotals['S2'],
                'total_s3' => $jenjangTotals['S3'],
                'total_profesi' => $jenjangTotals['Profesi'],
                'total_sp1' => $jenjangTotals['Sp-1'],
                'total_sp2' => $jenjangTotals['Sp-2'],
            ],
        ];
    }

    /**
     * Get list of prodi by fakultas ID
     *
     * @param string $fakultasId
     * @param string|null $periode
     * @return array
     */
    public function getProdiByFakultas(string $fakultasId, ?string $periode = null): array
    {
        $periode = $periode ?? $this->getActivePeriod();
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                sms.id_sms AS id,
                sms.nm_lemb AS nama,
                sms.kode_prodi,
                didik.nm_jenj_didik AS jenjang,
                COALESCE(akred.nm_akred, 'Belum Akreditasi') AS akreditasi
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
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
                AND sms.id_fak_unila = ?
            ORDER BY didik.id_jenj_didik, sms.nm_lemb
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $fakultasId]);

        return array_map(function($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'kode_prodi' => $item->kode_prodi,
                'jenjang' => $item->jenjang,
                'akreditasi' => $item->akreditasi,
            ];
        }, $result);
    }
}
