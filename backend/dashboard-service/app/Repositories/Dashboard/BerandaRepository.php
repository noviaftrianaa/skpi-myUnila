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
}
