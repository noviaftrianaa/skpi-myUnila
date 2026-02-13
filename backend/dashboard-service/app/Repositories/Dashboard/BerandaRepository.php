<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class BerandaRepository extends BaseRepository
{
    // =========================================
    // MAHASISWA STATS
    // =========================================

    public function countMahasiswaAktif(): int
    {
        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countMahasiswaCuti(): int
    {
        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '4'
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countTotalMahasiswa(): int
    {
        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // SDM STATS
    // =========================================

    public function countDosen(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countTendik(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // AKADEMIK STATS
    // =========================================

    public function countProdiAktif(): int
    {
        $sql = "
            SELECT COUNT(s.id_sms)
            FROM pdrd.sms s
            WHERE s.soft_delete = 0
              AND s.stat_prodi = 'A'
              AND s.id_sp = ?
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countProdiUnggul(): int
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
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ('Unggul', 'A')
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countAkreditasiInternasional(): int
    {
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
        ";

        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // KEUANGAN STATS
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
    // PENELITIAN STATS
    // =========================================

    public function countPenelitian(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT COUNT(*)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND l.jns_litabmas = 'L'
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countPublikasi(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT COUNT(*)
            FROM pdrd.publikasi p
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // KERJASAMA STATS
    // =========================================

    public function countMitra(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT m.id_mou)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
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

    public function getPopulasiTrend(array $semesters): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;

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
                    WHERE rp.id_sp = ? AND rp.soft_delete = 0
                      AND rp.id_jns_keluar IS NULL
                      AND YEAR(rp.tgl_masuk_sp) <= y.yr
                ) as value,
                'Mahasiswa' as category
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, [$startYear, $maxYear, self::UNILA_ID_SP]);
    }

    public function getAkreditasiDist(): array
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
