<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class AkreditasiRepository extends BaseRepository
{
    /**
     * Base CTE: get latest active akreditasi per prodi
     * Each prodi only gets its most recent accreditation
     */
    private function latestAkreditasiCTE(): string
    {
        // CANONICAL: ORDER BY tanggal_sk_akreditasi_prodi (effective date) — sesuai logic
        // di public-service & Pimpinan beranda. tst_sk = expiry date kadang null/inkonsisten.
        return "
            latest_akred AS (
                SELECT
                    ap.id_akreditasi_prodi,
                    ap.id_sms,
                    ap.id_akred,
                    ap.id_lemb_akred,
                    ap.sk_akreditasi_prodi,
                    ap.tanggal_sk_akreditasi_prodi,
                    ap.tst_sk_akreditasi_prodi,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
        ";
    }

    /**
     * Build inline filter clause utk INNER JOIN sms alias `s` (sudah ada di semua query).
     * Append bindings ke array yang di-pass by ref.
     */
    private function buildOrgFilter(?string $fakultas, ?string $prodi, array &$bindings): string
    {
        if ($prodi) {
            $bindings[] = $prodi;
            return ' AND s.id_sms = ?';
        }
        if ($fakultas) {
            $bindings[] = $fakultas;
            return ' AND s.id_fak_unila = ?';
        }
        return '';
    }

    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Count total prodi aktif (canonical Unila scope) — termasuk yang belum punya akreditasi.
     * Match Pimpinan beranda countProdiAktif = 132.
     */
    public function countTotalProdi(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = '';
        if ($prodi) { $orgFilter = ' AND s.id_sms = ?'; $bindings[] = $prodi; }
        elseif ($fakultas) { $orgFilter = ' AND s.id_fak_unila = ?'; $bindings[] = $fakultas; }

        $sql = "
            SELECT COUNT(s.id_sms)
            FROM pdrd.sms s
            WHERE s.soft_delete = 0
              AND s.stat_prodi = 'A'
              AND s.id_jns_sms = '3'
              AND s.id_fak_unila IS NOT NULL
              AND s.id_sp = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count prodi yang sudah punya SK akreditasi terbaru (latest_akred).
     * Selisih dgn countTotalProdi = prodi tanpa akreditasi (potensi alert).
     */
    public function countTerakreditasi(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            WHERE la.rn = 1
              AND s.id_sp = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count prodi with specific peringkat(s)
     * Accepts array of exact nm_akred values to match
     */
    public function countByPeringkat(array $peringkatList, ?string $fakultas = null, ?string $prodi = null): int
    {
        $placeholders = implode(',', array_fill(0, count($peringkatList), '?'));
        $bindings = array_merge([self::UNILA_ID_SP], $peringkatList);
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ({$placeholders})
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count akreditasi yang akan expire ≤ 90 hari (current latest per prodi)
     */
    public function countAkanExpire(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE())
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count akreditasi yang sudah expired (current latest per prodi)
     */
    public function countExpired(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi < GETDATE()
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count prodi dengan akreditasi internasional
     */
    public function countInternasional(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // DISTRIBUSI PERINGKAT (PieChart)
    // =========================================

    /**
     * Distribusi peringkat akreditasi [{name, value}]
     */
    public function getDistribusiPeringkat(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                na.nm_akred as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              {$orgFilter}
            GROUP BY na.nm_akred
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SISA MASA BERLAKU (BarChart horizontal)
    // =========================================

    /**
     * Status kadaluarsa akreditasi [{name: range, value: count}]
     */
    public function getStatusKadaluarsa(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                CASE
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 365 THEN '< 1 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 730 THEN '1-2 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 1095 THEN '2-3 Tahun'
                    ELSE '> 3 Tahun'
                END as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
              {$orgFilter}
            GROUP BY
                CASE
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 365 THEN '< 1 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 730 THEN '1-2 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 1095 THEN '2-3 Tahun'
                    ELSE '> 3 Tahun'
                END
            ORDER BY MIN(la.tst_sk_akreditasi_prodi)
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SEBARAN AKREDITASI PER FAKULTAS (DrilldownBarChart)
    // =========================================

    /**
     * Sebaran akreditasi per fakultas [{id, name, value}]
     * Top-level drilldown: total akred prodi count per fakultas
     *
     * NOTE: tidak menerima filter fakultas/prodi — by design aggregate per fakultas
     * supaya breakdown chart selalu tampil utuh.
     */
    public function getSebaranFakultas(): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id,
                uo.nm_lemb as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE la.rn = 1 AND s.id_sp = ?
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    /**
     * Sebaran prodi per fakultas [{id, name, value}]
     * Children for drilldown: prodi list with accreditation info
     */
    public function getSebaranProdi(string $idFakultas): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id,
                CONCAT(jp.nm_jenj_didik, ' - ', s.nm_lemb, ' (', na.nm_akred, ')') as name,
                1 as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik AND jp.expired_date IS NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1 AND s.id_sp = ? AND s.id_fak_unila = ?
            ORDER BY jp.nm_jenj_didik, s.nm_lemb
        ";

        return $this->select($sql, [self::UNILA_ID_SP, $idFakultas]);
    }

    // =========================================
    // AKREDITASI PER FAKULTAS - STACKED (BarChart)
    // =========================================

    /**
     * All peringkat per fakultas [{name: fakultas, value: count, category: peringkat}]
     * For stacked bar chart showing all accreditation levels
     *
     * NOTE: tidak menerima filter fakultas/prodi — by design aggregate per fakultas.
     */
    public function getAllPerFakultas(): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT la.id_sms) as value,
                na.nm_akred as category
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1 AND s.id_sp = ?
            GROUP BY uo.nm_lemb, na.nm_akred
            ORDER BY uo.nm_lemb, na.nm_akred
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // AKREDITASI INTERNASIONAL (BarChart + Detail)
    // =========================================

    /**
     * Akreditasi internasional grouped by lembaga [{name: lembaga, value: count}]
     */
    public function getInternasional(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                lem.nm_lemb as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1 AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
              {$orgFilter}
            GROUP BY lem.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Detail prodi with international accreditation [{prodi, fak, strata, lembaga, exp}]
     */
    public function getInternasionalDetail(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                s.nm_lemb as prodi,
                uo.nm_lemb as fak,
                jp.nm_jenj_didik as strata,
                lem.nm_lemb as lembaga,
                CONVERT(VARCHAR(10), la.tst_sk_akreditasi_prodi, 120) as exp
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik AND jp.expired_date IS NULL
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1 AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
              {$orgFilter}
            ORDER BY uo.nm_lemb, s.nm_lemb
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // EXPIRING PRODI (warning card)
    // =========================================

    /**
     * Prodi expiring within 1 year [{prodi, fak, strata, rank, int, exp}]
     */
    public function getExpiringProdi(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . ",
            intl AS (
                SELECT la2.id_sms, lem2.nm_lemb as nm_lemb_intl
                FROM latest_akred la2
                INNER JOIN ref.lembaga_akred lem2 ON la2.id_lemb_akred = lem2.id_lemb_akred
                WHERE la2.rn = 1 AND lem2.id_lemb_akred != '00001'
            )
            SELECT
                s.nm_lemb as prodi,
                uo.nm_lemb as fak,
                jp.nm_jenj_didik as strata,
                na.nm_akred as rank,
                ISNULL(intl.nm_lemb_intl, '-') as [int],
                CONVERT(VARCHAR(10), la.tst_sk_akreditasi_prodi, 120) as exp
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik AND jp.expired_date IS NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            LEFT JOIN intl ON intl.id_sms = la.id_sms
            WHERE la.rn = 1 AND s.id_sp = ?
              AND DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) BETWEEN 0 AND 365
              {$orgFilter}
            ORDER BY la.tst_sk_akreditasi_prodi ASC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // DETAIL TABLE
    // =========================================

    // =========================================
    // EXPIRY CALENDAR (12-month timeline)
    // =========================================

    /**
     * Jumlah akreditasi yg expire per bulan untuk 12 bulan ke depan.
     * Return: [{year, month, expiring_count}, ...]
     */
    public function getExpiryCalendar(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                YEAR(la.tst_sk_akreditasi_prodi) as year,
                MONTH(la.tst_sk_akreditasi_prodi) as month,
                COUNT(DISTINCT la.id_sms) as expiring_count
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(MONTH, 12, GETDATE())
              {$orgFilter}
            GROUP BY YEAR(la.tst_sk_akreditasi_prodi), MONTH(la.tst_sk_akreditasi_prodi)
            ORDER BY year, month
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Detail table: SEMUA prodi aktif Unila + akreditasi terbaru (kalau ada).
     *
     * Anchor di pdrd.sms (canonical 132 prodi) + LEFT JOIN ke latest_akred.
     * Prodi tanpa SK akreditasi tetap tampil dgn rank='Belum Akreditasi'.
     * Sebelumnya INNER JOIN dari latest_akred → 5 prodi tanpa akreditasi ke-exclude
     * sehingga total 127 vs canonical 132.
     */
    public function getDetailTable(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . ",
            intl AS (
                SELECT
                    la2.id_sms,
                    lem2.nm_lemb as nm_lemb_intl
                FROM latest_akred la2
                INNER JOIN ref.lembaga_akred lem2 ON la2.id_lemb_akred = lem2.id_lemb_akred
                WHERE la2.rn = 1
                  AND lem2.id_lemb_akred != '00001'
            )
            SELECT
                s.nm_lemb as prodi,
                uo.nm_lemb as fak,
                jp.nm_jenj_didik as strata,
                ISNULL(na.nm_akred, 'Belum Akreditasi') as rank,
                ISNULL(intl.nm_lemb_intl, '-') as [int],
                ISNULL(la.sk_akreditasi_prodi, '-') as no_sk,
                CASE WHEN la.tst_sk_akreditasi_prodi IS NULL THEN '-'
                     ELSE CONVERT(VARCHAR(10), la.tst_sk_akreditasi_prodi, 120) END as exp
            FROM pdrd.sms s
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik AND jp.expired_date IS NULL
            LEFT JOIN latest_akred la ON la.id_sms = s.id_sms AND la.rn = 1
            LEFT JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            LEFT JOIN intl ON intl.id_sms = s.id_sms
            WHERE s.soft_delete = 0
              AND s.stat_prodi = 'A'
              AND s.id_jns_sms = '3'
              AND s.id_fak_unila IS NOT NULL
              AND s.id_sp = ?
              {$orgFilter}
            ORDER BY uo.nm_lemb, s.nm_lemb
        ";

        return $this->select($sql, $bindings);
    }
}
