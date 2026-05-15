<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class BerandaRepository extends BaseRepository
{
    /**
     * Build extra JOIN + WHERE untuk filter fakultas/prodi via pdrd.sms.
     * Pakai alias kustom kalau caller butuh (default 's').
     */
    private function buildMhsOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): array
    {
        if (!$fakultas && !$prodi) {
            return ['', ''];
        }
        $join = " INNER JOIN pdrd.sms {$smsAlias} ON rp.id_sms = {$smsAlias}.id_sms AND {$smsAlias}.soft_delete = 0 ";
        $where = '';
        if ($prodi) {
            $where = " AND {$smsAlias}.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND {$smsAlias}.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    private function buildSdmOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): array
    {
        if (!$fakultas && !$prodi) {
            return ['', ''];
        }
        $join = " INNER JOIN pdrd.sms {$smsAlias} ON ptk.id_sms = {$smsAlias}.id_sms AND {$smsAlias}.soft_delete = 0 ";
        $where = '';
        if ($prodi) {
            $where = " AND {$smsAlias}.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND {$smsAlias}.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    private function buildSmsOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): string
    {
        if ($prodi) {
            $bindings[] = $prodi;
            return " AND {$smsAlias}.id_sms = ?";
        }
        if ($fakultas) {
            $bindings[] = $fakultas;
            return " AND {$smsAlias}.id_fak_unila = ?";
        }
        return '';
    }

    // =========================================
    // MAHASISWA STATS
    // =========================================

    public function countMahasiswaAktif(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            {$joinSql}
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countMahasiswaCuti(?string $fakultas = null, ?string $prodi = null): int
    {
        // CUTI sebenarnya ada di pdrd.kuliah_mhs.id_stat_mhs='C' (status per semester),
        // BUKAN di reg_pd.id_jns_keluar.
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT km.id_reg_pd)
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
                AND rp.id_sp = ? AND rp.soft_delete = 0
            {$joinSql}
            WHERE km.soft_delete = 0
              AND km.id_stat_mhs = 'C'
              AND km.id_smt = (
                  SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                  WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
              )
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countTotalMahasiswa(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            {$joinSql}
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // SDM STATS
    // =========================================

    public function countDosen(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countTendik(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // AKADEMIK STATS
    // =========================================

    public function countProdiAktif(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(s.id_sms)
            FROM pdrd.sms s
            WHERE s.soft_delete = 0
              AND s.stat_prodi = 'A'
              AND s.id_sp = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countProdiUnggul(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ('Unggul', 'A')
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countAkreditasiInternasional(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_lemb_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // KEUANGAN STATS (institusional — no scope narrow)
    // =========================================

    public function getTotalPendapatanUKT(array $semesters): int
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.total_tagihan AS FLOAT) - CAST(ISNULL(sm.sisa_tagihan, 0) AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // PENELITIAN STATS (institusional)
    // =========================================

    public function countPenelitian(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        if (empty($years)) {
            return (int) $this->selectScalar(
                "SELECT COUNT(*) FROM pdrd.litabmas WHERE soft_delete = 0 AND jns_litabmas = 'L'"
            );
        }
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        return (int) $this->selectScalar(
            "SELECT COUNT(*) FROM pdrd.litabmas WHERE soft_delete = 0 AND jns_litabmas = 'L'
             AND CAST(id_thn_kegiatan AS VARCHAR) IN {$inClause}",
            $bindings
        );
    }

    public function countPublikasi(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        if (empty($years)) {
            return (int) $this->selectScalar(
                "SELECT COUNT(*) FROM pdrd.publikasi WHERE soft_delete = 0"
            );
        }
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        return (int) $this->selectScalar(
            "SELECT COUNT(*) FROM pdrd.publikasi WHERE soft_delete = 0
             AND YEAR(tgl_terbit) IN {$inClause}",
            $bindings
        );
    }

    // =========================================
    // KERJASAMA STATS (institusional)
    // =========================================

    public function countMitra(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT m.nm_dudi)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
              AND m.nm_dudi IS NOT NULL AND m.nm_dudi <> ''
        ";

        return (int) $this->selectScalar($sql, []);
    }

    public function countMou(): int
    {
        $sql = "
            SELECT COUNT(*)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
        ";

        return (int) $this->selectScalar($sql, []);
    }

    // =========================================
    // CHARTS
    // =========================================

    public function getPopulasiTrend(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                (
                    SELECT COUNT(rp.id_reg_pd)
                    FROM pdrd.reg_pd rp
                    {$joinSql}
                    WHERE rp.id_sp = ? AND rp.soft_delete = 0
                      AND rp.id_jns_keluar IS NULL
                      AND YEAR(rp.tgl_masuk_sp) <= y.yr
                      {$whereSql}
                ) as value,
                'Mahasiswa' as category
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    public function getAkreditasiDist(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT
                na.nm_akred as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              {$orgFilter}
            GROUP BY na.nm_akred
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getFakultasData(): array
    {
        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(rp.id_reg_pd) as value,
                'Mahasiswa' as category
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // TREND Y-OVER-Y (5 years)
    // =========================================

    /**
     * Trend 5 tahun (Y-4 .. Y) untuk 4 metrik utama.
     * Return: ['years' => [...], 'mahasiswa' => [...], 'guruBesar' => [...], 'publikasi' => [...], 'akreditasiUnggul' => [...]]
     *
     * - Mahasiswa: jumlah mahasiswa aktif pada akhir tahun X (tgl_masuk_sp <= year-end, blm keluar).
     * - Guru Besar: jumlah SDM dgn jabfung Profesor yg aktif di tahun X (jabatan_fungsional.tmt_jbtn <= year-end).
     * - Publikasi: COUNT pdrd.publikasi by YEAR(tgl_terbit) = X.
     * - Akreditasi Unggul: jumlah prodi aktif dgn akreditasi Unggul/A pada akhir tahun X.
     */
    public function getTrendYoY(?string $fakultas = null, ?string $prodi = null): array
    {
        $currentYear = (int) date('Y');
        $years = [];
        for ($y = $currentYear - 4; $y <= $currentYear; $y++) {
            $years[] = $y;
        }

        return [
            'years' => array_map('strval', $years),
            'mahasiswa' => $this->trendMahasiswaAktif($years, $fakultas, $prodi),
            'guruBesar' => $this->trendGuruBesar($years, $fakultas, $prodi),
            'publikasi' => $this->trendPublikasi($years, $fakultas, $prodi),
            'akreditasiUnggul' => $this->trendAkreditasiUnggul($years, $fakultas, $prodi),
        ];
    }

    private function trendMahasiswaAktif(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            $bindings = [self::UNILA_ID_SP];
            [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);
            $bindings[] = $year;
            $bindings[] = $year;

            // Mahasiswa aktif di tahun X: sudah masuk <= akhir tahun X dan belum keluar (id_jns_keluar IS NULL atau tgl_keluar > akhir tahun)
            $sql = "
                SELECT COUNT(rp.id_reg_pd)
                FROM pdrd.reg_pd rp
                {$joinSql}
                WHERE rp.id_sp = ? AND rp.soft_delete = 0
                  AND YEAR(rp.tgl_masuk_sp) <= ?
                  AND (rp.tgl_keluar IS NULL OR YEAR(rp.tgl_keluar) > ?)
                  {$whereSql}
            ";
            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }

    private function trendGuruBesar(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            $bindings = [self::UNILA_ID_SP];
            [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);
            $bindings[] = $year;

            // Guru Besar = SDM yg pernah mencapai jabfung 'Profesor' dengan tmt_sk_jabfung <= year-end
            // Table canonical: pdrd.rwy_fungsional (BUKAN jabatan_fungsional) + ref.jabfung
            $sql = "
                SELECT COUNT(DISTINCT sdm.id_sdm)
                FROM pdrd.sdm sdm
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                {$joinSql}
                INNER JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                INNER JOIN ref.jabfung rjf ON rjf.id_jabfung = rf.id_jabfung
                WHERE sdm.soft_delete = 0
                  AND sdm.id_jns_sdm = 12
                  AND (UPPER(rjf.nm_jabfung) LIKE 'PROFESOR%' OR UPPER(rjf.nm_jabfung) LIKE '%GURU BESAR%')
                  AND YEAR(rf.tmt_sk_jabfung) <= ?
                  {$whereSql}
            ";
            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }

    private function trendPublikasi(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            // Narrow per fakultas/prodi: publikasi → litabmas → sdm_anggota_litabmas → reg_ptk → sms
            if ($fakultas || $prodi) {
                $bindings = [$year, self::UNILA_ID_SP];
                $orgFilter = '';
                if ($prodi) {
                    $orgFilter = " AND ps.id_sms = ?";
                    $bindings[] = $prodi;
                } elseif ($fakultas) {
                    $orgFilter = " AND ps.id_fak_unila = ?";
                    $bindings[] = $fakultas;
                }
                $sql = "
                    SELECT COUNT(DISTINCT p.id_publikasi)
                    FROM pdrd.publikasi p
                    INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = p.id_litabmas AND sal.soft_delete = 0
                    INNER JOIN pdrd.reg_ptk pp ON pp.id_sdm = sal.id_sdm AND pp.soft_delete = 0
                        AND pp.id_jns_keluar IS NULL AND CAST(pp.id_sp AS VARCHAR(50)) = ?
                    INNER JOIN pdrd.sms ps ON pp.id_sms = ps.id_sms AND ps.soft_delete = 0
                    WHERE p.soft_delete = 0
                      AND YEAR(p.tgl_terbit) = ?
                      {$orgFilter}
                ";
                // Rearrange bindings: $year first param for YEAR, $UNILA_ID_SP for ptk
                $bindings = [self::UNILA_ID_SP, $year];
                if ($prodi) $bindings[] = $prodi;
                elseif ($fakultas) $bindings[] = $fakultas;
                $result[] = (int) $this->selectScalar($sql, $bindings);
            } else {
                $sql = "
                    SELECT COUNT(*)
                    FROM pdrd.publikasi
                    WHERE soft_delete = 0
                      AND YEAR(tgl_terbit) = ?
                ";
                $result[] = (int) $this->selectScalar($sql, [$year]);
            }
        }
        return $result;
    }

    // =========================================
    // TOP 5 FAKULTAS (per metric)
    // =========================================

    /**
     * Top 5 fakultas untuk 4 metric:
     *  - mahasiswa: mahasiswa aktif terbanyak per fakultas
     *  - dosen: dosen aktif terbanyak per fakultas (id_jns_sdm = 12)
     *  - publikasi: publikasi 5 tahun terakhir per fakultas (via litabmas → reg_ptk → sms)
     *  - akreditasiUnggul: jumlah prodi dgn akreditasi Unggul/A per fakultas
     *
     * Return: ['mahasiswa' => [{id_fak,nm_fakultas,value}], 'dosen' => [...], 'publikasi' => [...], 'akreditasiUnggul' => [...]]
     */
    public function getTop5Fakultas(): array
    {
        return [
            'mahasiswa'        => $this->top5Mahasiswa(),
            'dosen'            => $this->top5Dosen(),
            'publikasi'        => $this->top5Publikasi(),
            'akreditasiUnggul' => $this->top5AkreditasiUnggul(),
        ];
    }

    private function top5Mahasiswa(): array
    {
        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    private function top5Dosen(): array
    {
        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    private function top5Publikasi(): array
    {
        $currentYear = (int) date('Y');
        $startYear = $currentYear - 4;

        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = p.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk pp ON pp.id_sdm = sal.id_sdm AND pp.soft_delete = 0
                AND pp.id_jns_keluar IS NULL AND CAST(pp.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms ps ON pp.id_sms = ps.id_sms AND ps.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON ps.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) BETWEEN ? AND ?
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP, $startYear, $currentYear]);
    }

    private function top5AkreditasiUnggul(): array
    {
        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ('Unggul', 'A')
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // ALERTS — Pusat Peringatan Beranda Pimpinan
    // =========================================

    /**
     * Aggregate alert untuk Beranda Pimpinan.
     * Return: assoc array dgn 4 key (akreditasi_expire, dosen_pensiun, dosen_tanpa_nidn, dosen_tanpa_jabfung)
     * — masing-masing { count, label, severity, link }.
     */
    public function getAlerts(?string $fakultas = null, ?string $prodi = null): array
    {
        $akreditasiExpire   = $this->countAkreditasiExpireAlert($fakultas, $prodi);
        $dosenPensiun       = $this->countDosenPensiunAlert($fakultas, $prodi);
        $dosenTanpaNidn     = $this->countDosenTanpaNidn($fakultas, $prodi);
        $dosenTanpaJabfung  = $this->countDosenTanpaJabfung($fakultas, $prodi);

        return [
            'akreditasi_expire' => [
                'count'    => $akreditasiExpire,
                'label'    => 'Akreditasi akan kadaluarsa ≤90 hari',
                'severity' => 'high',
                'link'     => '/dashboard/data-unila/akademik/akreditasi?expiring=soon',
            ],
            'dosen_pensiun' => [
                'count'    => $dosenPensiun,
                'label'    => 'Dosen akan pensiun ≤12 bulan',
                'severity' => 'medium',
                'link'     => '/dashboard/data-unila/dosen?status=aktif',
            ],
            'dosen_tanpa_nidn' => [
                'count'    => $dosenTanpaNidn,
                'label'    => 'Dosen aktif tanpa NIDN',
                'severity' => 'low',
                'link'     => '/dashboard/data-unila/dosen',
            ],
            'dosen_tanpa_jabfung' => [
                'count'    => $dosenTanpaJabfung,
                'label'    => 'Dosen aktif tanpa Jabatan Fungsional',
                'severity' => 'low',
                'link'     => '/dashboard/data-unila/dosen/jabfung',
            ],
        ];
    }

    private function countAkreditasiExpireAlert(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.tst_sk_akreditasi_prodi,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE())
              {$orgFilter}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenPensiunAlert(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        // Dosen aktif Unila + jns_sdm=12 + id_stat_aktif=1 + akan capai usia 60 ≤12 bulan
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND sdm.tgl_lahir IS NOT NULL
              AND DATEADD(YEAR, 60, sdm.tgl_lahir) BETWEEN GETDATE() AND DATEADD(MONTH, 12, GETDATE())
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenTanpaNidn(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND (sdm.nidn IS NULL OR sdm.nidn = '')
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenTanpaJabfung(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        // Dosen aktif tanpa baris di pdrd.rwy_fungsional (NOT EXISTS).
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND NOT EXISTS (
                  SELECT 1 FROM pdrd.rwy_fungsional rf
                  WHERE rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
              )
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function trendAkreditasiUnggul(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            $bindings = [self::UNILA_ID_SP];
            $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);
            $bindings[] = $year;
            $bindings[] = $year;

            // Akreditasi Unggul/A yang berlaku di tahun X.
            // Schema: tanggal_sk_akreditasi_prodi (efektif) + tst_sk_akreditasi_prodi (expire).
            // Valid di tahun X: tanggal_sk <= year-end X AND tst_sk >= year-start X (overlap).
            // Pick latest active per sms (ROW_NUMBER ordered by tanggal_sk DESC).
            $sql = "
                ;WITH latest_akred AS (
                    SELECT
                        ap.id_sms,
                        ap.id_akred,
                        ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS rn
                    FROM pdrd.akreditasi_prodi ap
                    WHERE ap.soft_delete = 0
                      AND YEAR(ap.tanggal_sk_akreditasi_prodi) <= ?
                      AND (ap.tst_sk_akreditasi_prodi IS NULL OR YEAR(ap.tst_sk_akreditasi_prodi) >= ?)
                )
                SELECT COUNT(DISTINCT la.id_sms)
                FROM latest_akred la
                INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
                INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
                WHERE la.rn = 1
                  AND s.id_sp = ?
                  AND na.nm_akred IN ('Unggul', 'A')
                  {$orgFilter}
            ";
            $bindings = [$year, $year, self::UNILA_ID_SP];
            if ($prodi) $bindings[] = $prodi;
            elseif ($fakultas) $bindings[] = $fakultas;

            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }
}
