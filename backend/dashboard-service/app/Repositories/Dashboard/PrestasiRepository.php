<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class PrestasiRepository extends BaseRepository
{
    // =========================================
    // STAT CARDS
    // =========================================

    public function countTotalPrestasi(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(p.id_prestasi)
            FROM pdrd.prestasi p
            INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE p.soft_delete = 0
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count by tingkat prestasi ID
     * IDs: 5=Nasional, 6=Internasional
     */
    public function countByTingkat(array $semesters, int $idTktPrestasi, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $bindings[] = $idTktPrestasi;
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(p.id_prestasi)
            FROM pdrd.prestasi p
            INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE p.soft_delete = 0
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
              AND p.id_tkt_prestasi = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // TREND PRESTASI (5 tahun)
    // =========================================

    public function getTrendPrestasi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                (
                    SELECT COUNT(p.id_prestasi)
                    FROM pdrd.prestasi p
                    INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
                    INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
                    INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
                    WHERE p.soft_delete = 0
                      AND p.thn_prestasi = y.yr
                      {$orgFilter}
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // PRESTASI PER TINGKAT (Stacked Bar - 3 years)
    // id_tkt_prestasi: 1-4,7,9 = Lokal, 5 = Nasional, 6 = Internasional
    // =========================================

    public function getPrestasiPerTingkat(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 2;
        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            ),
            tingkat AS (
                SELECT 'Lokal' AS cat
                UNION ALL SELECT 'Nasional'
                UNION ALL SELECT 'Internasional'
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                t.cat as category,
                (
                    SELECT COUNT(p.id_prestasi)
                    FROM pdrd.prestasi p
                    INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
                    INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
                    INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
                    WHERE p.soft_delete = 0
                      AND p.thn_prestasi = y.yr
                      AND (
                          (t.cat = 'Lokal' AND p.id_tkt_prestasi IN (1,2,3,4,7,9))
                          OR (t.cat = 'Nasional' AND p.id_tkt_prestasi = 5)
                          OR (t.cat = 'Internasional' AND p.id_tkt_prestasi = 6)
                      )
                      {$orgFilter}
                ) as value
            FROM years y
            CROSS JOIN tingkat t
            ORDER BY y.yr, t.cat
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // JENIS BIDANG PRESTASI (PieChart)
    // =========================================

    public function getJenisPrestasi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(jp.nm_jenis_prestasi, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM pdrd.prestasi p
            INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_prestasi jp ON p.id_jenis_prestasi = jp.id_jenis_prestasi
            WHERE p.soft_delete = 0
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY jp.nm_jenis_prestasi
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TOP 10 PRODI BERPRESTASI (BarChart)
    // =========================================

    public function getTopProdi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $orgFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT TOP 10
                s.nm_lemb as name,
                COUNT(p.id_prestasi) as value
            FROM pdrd.prestasi p
            INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE p.soft_delete = 0
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY s.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // PRESTASI PER FAKULTAS (BarChart)
    // Aggregate breakdown — TIDAK narrow ke single fakultas/prodi,
    // tetap menampilkan seluruh fakultas supaya drill-down user kelihatan.
    // =========================================

    public function getPerFakultas(array $semesters): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(p.id_prestasi) as value
            FROM pdrd.prestasi p
            INNER JOIN pdrd.peserta_didik pd ON p.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0 AND rp.id_sp = ?
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE p.soft_delete = 0
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // PRESTASI MHS COUNT
    // =========================================

    public function countPrestasiMahasiswa(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT COUNT(p.id_prestasi)
            FROM pdrd.prestasi p
            WHERE p.soft_delete = 0
              AND p.id_sp = ?
              AND CAST(p.thn_prestasi AS VARCHAR) IN {$inClause}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // PUBLIKASI SECTION
    // =========================================

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

    public function getTrendPublikasi(array $semesters): array
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
                (SELECT COUNT(*) FROM pdrd.publikasi p WHERE p.soft_delete = 0 AND YEAR(p.tgl_terbit) = y.yr) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, [$startYear, $maxYear]);
    }

    public function getJenisPublikasi(array $semesters): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                ISNULL(jp.nm_jns_pub, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM pdrd.publikasi p
            LEFT JOIN ref.jenis_publikasi jp ON p.id_jns_pub = jp.id_jns_pub
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
            GROUP BY jp.nm_jns_pub
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // HKI PER FAKULTAS
    // =========================================

    public function getHkiPerFakultas(array $semesters): array
    {
        // Window: 5 tahun terakhir dari max year semester yg dipilih (HKI bersifat akumulatif,
        // 1 tahun saja sering 0 karena data sync delayed). Sama logic dgn top5Publikasi.
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [self::UNILA_ID_SP, $startYear, $maxYear];

        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN ref.jenis_publikasi jp ON p.id_jns_pub = jp.id_jns_pub
            INNER JOIN pdrd.tulis_pub tp2 ON tp2.id_publikasi = p.id_publikasi AND tp2.soft_delete = 0
            INNER JOIN pdrd.sdm sdm ON tp2.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) BETWEEN ? AND ?
              AND (
                  UPPER(jp.nm_jns_pub) LIKE '%HKI%'
                  OR UPPER(jp.nm_jns_pub) LIKE '%HAK CIPTA%'
                  OR UPPER(jp.nm_jns_pub) LIKE '%PATEN%'
              )
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
