<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class DosenRepository extends BaseRepository
{
    // =========================================
    // HELPER: base dosen join
    // =========================================

    /**
     * Build the common dosen base query fragment
     * Returns: sdm.*, reg_ptk, sms linked active dosen at UNILA
     */
    private function baseDosenJoin(): string
    {
        return "
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        ";
    }

    /**
     * Build fakultas filter for dosen queries (uses sms alias 's')
     */
    private function buildDosenFakultasFilter(?string $fakultas, array &$bindings): string
    {
        if ($fakultas) {
            $bindings[] = $fakultas;
            return " AND s.id_fak_unila = ?";
        }
        return "";
    }

    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Count total dosen aktif
     */
    public function countTotal(?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "SELECT COUNT(DISTINCT sdm.id_sdm) " . $this->baseDosenJoin() . $fakFilter;

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count dosen dengan jabfung Guru Besar (Profesor)
     */
    public function countGuruBesar(?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
            INNER JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND (UPPER(jf.nm_jabfung) LIKE '%GURU BESAR%' OR UPPER(jf.nm_jabfung) LIKE '%PROFESOR%')
              AND rf.id_rwy_jabfung = (
                  SELECT TOP 1 rf2.id_rwy_jabfung
                  FROM pdrd.rwy_fungsional rf2
                  WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                  ORDER BY rf2.tmt_sk_jabfung DESC
              )
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count dosen bergelar S3 (Doktor)
     */
    public function countDoktor(?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN pdrd.rwy_pend_formal rpf ON rpf.id_sdm = sdm.id_sdm AND rpf.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON rpf.id_jenj_didik = jp.id_jenj_didik
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND (UPPER(jp.nm_jenj_didik) LIKE '%S3%' OR UPPER(jp.nm_jenj_didik) LIKE '%DOKTOR%')
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Rasio dosen : mahasiswa
     */
    public function getRasio(?string $fakultas = null): string
    {
        $totalDosen = $this->countTotal($fakultas);

        $bindings = [self::UNILA_ID_SP];
        $fakFilter = '';
        if ($fakultas) {
            $fakFilter = " AND s.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              {$fakFilter}
        ";

        $totalMhs = (int) $this->selectScalar($sql, $bindings);

        if ($totalDosen === 0) {
            return "0:0";
        }

        $ratio = round($totalMhs / $totalDosen);
        return "1:{$ratio}";
    }

    // =========================================
    // JENJANG PENDIDIKAN (PieChart)
    // =========================================

    /**
     * Distribusi jenjang pendidikan tertinggi dosen
     */
    public function getJenjangPendidikan(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                jp.nm_jenj_didik as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN pdrd.rwy_pend_formal rpf ON rpf.id_sdm = sdm.id_sdm AND rpf.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON rpf.id_jenj_didik = jp.id_jenj_didik
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND rpf.id_jenj_didik = (
                  SELECT MAX(rpf2.id_jenj_didik)
                  FROM pdrd.rwy_pend_formal rpf2
                  WHERE rpf2.id_sdm = sdm.id_sdm AND rpf2.soft_delete = 0
              )
              {$fakFilter}
            GROUP BY jp.nm_jenj_didik
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SEBARAN FAKULTAS (DrilldownBarChart)
    // =========================================

    /**
     * Sebaran dosen per fakultas
     */
    public function getSebaranFakultas(): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id,
                uo.nm_lemb as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND uo.soft_delete = 0
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    /**
     * Sebaran dosen per prodi dalam satu fakultas (children drilldown)
     */
    public function getSebaranProdi(string $idFakultas): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id,
                s.nm_lemb as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND s.id_fak_unila = ?
            GROUP BY s.id_sms, s.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP, $idFakultas]);
    }

    // =========================================
    // HEATMAP: PENDIDIKAN x JABATAN FUNGSIONAL
    // =========================================

    /**
     * Heatmap pendidikan vs jabatan fungsional
     * Returns [{x: jabfung, y: jenjang, value: count}]
     */
    public function getHeatmapPendidikanJabfung(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                ISNULL(jf.nm_jabfung, 'Tenaga Pengajar') as x,
                jp.nm_jenj_didik as y,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            INNER JOIN pdrd.rwy_pend_formal rpf ON rpf.id_sdm = sdm.id_sdm AND rpf.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON rpf.id_jenj_didik = jp.id_jenj_didik
            LEFT JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                AND rf.id_rwy_jabfung = (
                    SELECT TOP 1 rf2.id_rwy_jabfung
                    FROM pdrd.rwy_fungsional rf2
                    WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                    ORDER BY rf2.tmt_sk_jabfung DESC
                )
            LEFT JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND rpf.id_jenj_didik = (
                  SELECT MAX(rpf2.id_jenj_didik)
                  FROM pdrd.rwy_pend_formal rpf2
                  WHERE rpf2.id_sdm = sdm.id_sdm AND rpf2.soft_delete = 0
              )
              {$fakFilter}
            GROUP BY jf.nm_jabfung, jp.nm_jenj_didik
            ORDER BY y, x
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // HEATMAP: USIA x JABATAN FUNGSIONAL
    // =========================================

    /**
     * Heatmap usia vs jabatan fungsional
     * Returns [{x: jabfung, y: ageGroup, value: count}]
     */
    public function getHeatmapUsiaJabfung(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                ISNULL(jf.nm_jabfung, 'Tenaga Pengajar') as x,
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 40 THEN '30-40'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 50 THEN '41-50'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 60 THEN '51-60'
                    ELSE '> 60'
                END as y,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            LEFT JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                AND rf.id_rwy_jabfung = (
                    SELECT TOP 1 rf2.id_rwy_jabfung
                    FROM pdrd.rwy_fungsional rf2
                    WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                    ORDER BY rf2.tmt_sk_jabfung DESC
                )
            LEFT JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$fakFilter}
            GROUP BY jf.nm_jabfung,
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 40 THEN '30-40'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 50 THEN '41-50'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 60 THEN '51-60'
                    ELSE '> 60'
                END
            ORDER BY y, x
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // IKATAN KERJA (PieChart)
    // =========================================

    /**
     * Distribusi ikatan kerja dosen (PNS, PPPK, Tetap Non-PNS, Kontrak)
     */
    public function getIkatanKerja(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN ptk.id_stat_pegawai = 1 THEN 'PNS'
                    WHEN ptk.id_stat_pegawai = 2 THEN 'PPPK'
                    WHEN ptk.id_ikatan_kerja = '1' THEN 'Tetap Non-PNS'
                    ELSE 'Kontrak/LB'
                END as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN ptk.id_stat_pegawai = 1 THEN 'PNS'
                    WHEN ptk.id_stat_pegawai = 2 THEN 'PPPK'
                    WHEN ptk.id_ikatan_kerja = '1' THEN 'Tetap Non-PNS'
                    ELSE 'Kontrak/LB'
                END
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // GENDER & USIA (PyramidChart)
    // =========================================

    /**
     * Distribusi gender dan usia dosen
     * Returns [{ageGroup, male, female}]
     */
    public function getGenderUsia(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '20-29'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 59 THEN '50-59'
                    ELSE '60+'
                END as ageGroup,
                SUM(CASE WHEN sdm.jk = 'L' THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN sdm.jk = 'P' THEN 1 ELSE 0 END) as female
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '20-29'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) <= 59 THEN '50-59'
                    ELSE '60+'
                END
            ORDER BY ageGroup
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SERTIFIKASI PER JABFUNG (Stacked BarChart)
    // =========================================

    /**
     * Sertifikasi dosen per jabatan fungsional
     * Returns [{name: jabfung, value: count, category: 'Sudah Serdos'/'Belum Serdos'}]
     */
    public function getSertifikasiJabfung(?string $fakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildDosenFakultasFilter($fakultas, $bindings);

        $sql = "
            SELECT
                ISNULL(jf.nm_jabfung, 'Tenaga Pengajar') as jabfung,
                SUM(CASE WHEN rs.id_rwy_sert IS NOT NULL THEN 1 ELSE 0 END) as sudah,
                SUM(CASE WHEN rs.id_rwy_sert IS NULL THEN 1 ELSE 0 END) as belum
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            LEFT JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                AND rf.id_rwy_jabfung = (
                    SELECT TOP 1 rf2.id_rwy_jabfung
                    FROM pdrd.rwy_fungsional rf2
                    WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                    ORDER BY rf2.tmt_sk_jabfung DESC
                )
            LEFT JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
            LEFT JOIN pdrd.rwy_sertifikasi rs ON rs.id_sdm = sdm.id_sdm AND rs.soft_delete = 0
                AND rs.id_rwy_sert = (
                    SELECT TOP 1 rs2.id_rwy_sert
                    FROM pdrd.rwy_sertifikasi rs2
                    WHERE rs2.id_sdm = sdm.id_sdm AND rs2.soft_delete = 0
                    ORDER BY rs2.thn_sert DESC
                )
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$fakFilter}
            GROUP BY jf.nm_jabfung
            ORDER BY jabfung
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TREN SERTIFIKASI 5 TAHUN (LineChart)
    // =========================================

    /**
     * Tren jumlah dosen bersertifikasi 5 tahun terakhir
     */
    public function getTrenSertifikasi(array $semesters): array
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
                    SELECT COUNT(DISTINCT rs.id_sdm)
                    FROM pdrd.rwy_sertifikasi rs
                    INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = rs.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
                    INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                    WHERE rs.soft_delete = 0
                      AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                      AND rs.thn_sert <= y.yr
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, [$startYear, $maxYear, self::UNILA_ID_SP]);
    }

    // =========================================
    // TREN JABATAN FUNGSIONAL 5 TAHUN (Stacked BarChart)
    // =========================================

    /**
     * Tren jabatan fungsional 5 tahun terakhir
     * Returns [{name: year, value: count, category: jabfung}]
     */
    public function getTrenJabfung(array $semesters): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            ),
            dosen_jabfung AS (
                SELECT
                    sdm.id_sdm,
                    CASE
                        WHEN jf.nm_jabfung LIKE 'Profesor%' THEN 'Guru Besar'
                        WHEN jf.nm_jabfung LIKE 'Lektor Kepala%' THEN 'Lektor Kepala'
                        WHEN jf.nm_jabfung LIKE 'Lektor%' THEN 'Lektor'
                        WHEN jf.nm_jabfung LIKE 'Asisten Ahli%' THEN 'Asisten Ahli'
                    END as category,
                    YEAR(rf.tmt_sk_jabfung) as tahun_jabfung
                FROM pdrd.sdm sdm
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                INNER JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                INNER JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
                WHERE sdm.soft_delete = 0
                  AND sdm.id_jns_sdm = 12
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                  AND (jf.nm_jabfung LIKE 'Profesor%'
                       OR jf.nm_jabfung LIKE 'Lektor Kepala%'
                       OR jf.nm_jabfung LIKE 'Lektor%'
                       OR jf.nm_jabfung LIKE 'Asisten Ahli%')
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                c.category,
                COUNT(DISTINCT dj.id_sdm) as value
            FROM years y
            CROSS JOIN (
                SELECT 'Guru Besar' as category
                UNION ALL SELECT 'Lektor Kepala'
                UNION ALL SELECT 'Lektor'
                UNION ALL SELECT 'Asisten Ahli'
            ) c
            LEFT JOIN dosen_jabfung dj ON dj.category = c.category AND dj.tahun_jabfung <= y.yr
            GROUP BY y.yr, c.category
            ORDER BY y.yr, c.category
        ";

        return $this->select($sql, [$startYear, $maxYear, self::UNILA_ID_SP]);
    }
}
