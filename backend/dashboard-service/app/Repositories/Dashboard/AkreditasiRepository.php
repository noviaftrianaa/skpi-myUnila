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
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
        ";
    }

    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Count total prodi aktif yang terakreditasi
     */
    public function countTotalProdi(): int
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE la.rn = 1
              AND s.id_sp = ?
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    /**
     * Count prodi with specific peringkat(s)
     * Accepts array of exact nm_akred values to match
     */
    public function countByPeringkat(array $peringkatList): int
    {
        $placeholders = implode(',', array_fill(0, count($peringkatList), '?'));

        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ({$placeholders})
        ";

        return (int) $this->selectScalar($sql, array_merge([self::UNILA_ID_SP], $peringkatList));
    }

    /**
     * Count prodi dengan akreditasi internasional
     */
    public function countInternasional(): int
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // DISTRIBUSI PERINGKAT (PieChart)
    // =========================================

    /**
     * Distribusi peringkat akreditasi [{name, value}]
     */
    public function getDistribusiPeringkat(): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                na.nm_akred as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
            GROUP BY na.nm_akred
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // SISA MASA BERLAKU (BarChart horizontal)
    // =========================================

    /**
     * Status kadaluarsa akreditasi [{name: range, value: count}]
     */
    public function getStatusKadaluarsa(): array
    {
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
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
            GROUP BY
                CASE
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 365 THEN '< 1 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 730 THEN '1-2 Tahun'
                    WHEN DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) < 1095 THEN '2-3 Tahun'
                    ELSE '> 3 Tahun'
                END
            ORDER BY MIN(la.tst_sk_akreditasi_prodi)
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // SEBARAN AKREDITASI PER FAKULTAS (DrilldownBarChart)
    // =========================================

    /**
     * Sebaran akreditasi per fakultas [{id, name, value}]
     * Top-level drilldown: total akred prodi count per fakultas
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
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
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
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
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
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
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
    public function getInternasional(): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                lem.nm_lemb as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1 AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
            GROUP BY lem.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    /**
     * Detail prodi with international accreditation [{prodi, fak, strata, lembaga, exp}]
     */
    public function getInternasionalDetail(): array
    {
        $sql = "
            ;WITH " . $this->latestAkreditasiCTE() . "
            SELECT
                s.nm_lemb as prodi,
                uo.nm_lemb as fak,
                jp.nm_jenj_didik as strata,
                lem.nm_lemb as lembaga,
                CONVERT(VARCHAR(10), la.tst_sk_akreditasi_prodi, 120) as exp
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1 AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              AND la.tst_sk_akreditasi_prodi >= GETDATE()
            ORDER BY uo.nm_lemb, s.nm_lemb
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // EXPIRING PRODI (warning card)
    // =========================================

    /**
     * Prodi expiring within 1 year [{prodi, fak, strata, rank, int, exp}]
     */
    public function getExpiringProdi(): array
    {
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
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            LEFT JOIN intl ON intl.id_sms = la.id_sms
            WHERE la.rn = 1 AND s.id_sp = ?
              AND DATEDIFF(DAY, GETDATE(), la.tst_sk_akreditasi_prodi) BETWEEN 0 AND 365
            ORDER BY la.tst_sk_akreditasi_prodi ASC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // DETAIL TABLE
    // =========================================

    /**
     * Detail table: all prodi with their akreditasi info
     */
    public function getDetailTable(): array
    {
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
                na.nm_akred as rank,
                ISNULL(intl.nm_lemb_intl, '-') as [int],
                CONVERT(VARCHAR(10), la.tst_sk_akreditasi_prodi, 120) as exp
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            LEFT JOIN intl ON intl.id_sms = la.id_sms
            WHERE la.rn = 1
              AND s.id_sp = ?
            ORDER BY uo.nm_lemb, s.nm_lemb
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }
}
