<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class LulusanRepository extends BaseRepository
{
    // =========================================
    // STAT CARDS
    // =========================================

    public function countLulusan(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function getTepatWaktuPersen(array $semesters, ?string $fakultas = null, ?string $prodi = null): float
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ROUND(
                    CAST(SUM(CASE WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) <= 48 THEN 1 ELSE 0 END) AS FLOAT) /
                    NULLIF(COUNT(*), 0) * 100, 1
                )
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND rp.tgl_masuk_sp IS NOT NULL
              {$fakFilter}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 1);
    }

    public function getRataIPK(array $semesters, ?string $fakultas = null, ?string $prodi = null): float
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT ROUND(AVG(rp.ipk), 2)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND rp.ipk IS NOT NULL AND rp.ipk > 0
              {$fakFilter}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 2);
    }

    // =========================================
    // TREND KELULUSAN (5 tahun)
    // =========================================

    public function getTrendKelulusan(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

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
                    INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
                    WHERE rp.id_sp = ? AND rp.soft_delete = 0
                      AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
                      AND YEAR(rp.tgl_keluar) = y.yr
                      {$fakFilter}
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // KETEPATAN WAKTU (PieChart)
    // =========================================

    public function getKetepatanWaktu(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) <= 48 THEN 'Tepat Waktu (<=4 Tahun)'
                    ELSE 'Terlambat (>4 Tahun)'
                END as name,
                COUNT(*) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND rp.tgl_masuk_sp IS NOT NULL
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) <= 48 THEN 'Tepat Waktu (<=4 Tahun)'
                    ELSE 'Terlambat (>4 Tahun)'
                END
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // DISTRIBUSI IPK LULUSAN (BarChart)
    // =========================================

    public function getDistribusiIPK(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN rp.ipk >= 3.51 THEN '3.51 - 4.00'
                    WHEN rp.ipk >= 3.01 THEN '3.01 - 3.50'
                    WHEN rp.ipk >= 2.51 THEN '2.51 - 3.00'
                    ELSE '< 2.50'
                END as name,
                COUNT(*) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND rp.ipk IS NOT NULL AND rp.ipk > 0
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN rp.ipk >= 3.51 THEN '3.51 - 4.00'
                    WHEN rp.ipk >= 3.01 THEN '3.01 - 3.50'
                    WHEN rp.ipk >= 2.51 THEN '2.51 - 3.00'
                    ELSE '< 2.50'
                END
            ORDER BY name DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TRACER STUDY
    // =========================================

    public function getTracerStudyStatus(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE hts.status_lulusan
                    WHEN 1 THEN 'Bekerja'
                    WHEN 2 THEN 'Wiraswasta'
                    WHEN 3 THEN 'Kuliah Lanjut'
                    WHEN 4 THEN 'Belum Bekerja'
                    ELSE 'Tidak Diketahui'
                END as name,
                COUNT(DISTINCT hts.id_reg_pd) as value
            FROM tracer.hasil_tracer_study hts
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = hts.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE hts.soft_delete = 0
              AND rp.id_sp = ?
              AND rp.tgl_keluar IS NOT NULL
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
            GROUP BY hts.status_lulusan
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getMasaTungguKerja(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN CAST(hts.wkt_tunggu AS INT) < 3 THEN '< 3 Bulan'
                    WHEN CAST(hts.wkt_tunggu AS INT) < 6 THEN '3-6 Bulan'
                    WHEN CAST(hts.wkt_tunggu AS INT) < 12 THEN '6-12 Bulan'
                    ELSE '> 12 Bulan'
                END as name,
                COUNT(DISTINCT hts.id_reg_pd) as value
            FROM tracer.hasil_tracer_study hts
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = hts.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE hts.soft_delete = 0
              AND rp.id_sp = ?
              AND rp.tgl_keluar IS NOT NULL
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND hts.wkt_tunggu IS NOT NULL
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN CAST(hts.wkt_tunggu AS INT) < 3 THEN '< 3 Bulan'
                    WHEN CAST(hts.wkt_tunggu AS INT) < 6 THEN '3-6 Bulan'
                    WHEN CAST(hts.wkt_tunggu AS INT) < 12 THEN '6-12 Bulan'
                    ELSE '> 12 Bulan'
                END
            ORDER BY MIN(CAST(hts.wkt_tunggu AS INT))
        ";

        return $this->select($sql, $bindings);
    }

    public function getIncomeDistribusi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN '< 1 Juta'
                    WHEN hts.income_per_bln < 3000000 THEN '1-3 Juta'
                    WHEN hts.income_per_bln < 5000000 THEN '3-5 Juta'
                    WHEN hts.income_per_bln < 10000000 THEN '5-10 Juta'
                    ELSE '> 10 Juta'
                END as name,
                COUNT(DISTINCT hts.id_reg_pd) as value
            FROM tracer.hasil_tracer_study hts
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = hts.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE hts.soft_delete = 0
              AND rp.id_sp = ?
              AND rp.tgl_keluar IS NOT NULL
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND hts.income_per_bln IS NOT NULL
              AND hts.income_per_bln >= 100000
              AND hts.income_per_bln <= 50000000
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN hts.income_per_bln < 1000000 THEN '< 1 Juta'
                    WHEN hts.income_per_bln < 3000000 THEN '1-3 Juta'
                    WHEN hts.income_per_bln < 5000000 THEN '3-5 Juta'
                    WHEN hts.income_per_bln < 10000000 THEN '5-10 Juta'
                    ELSE '> 10 Juta'
                END
            ORDER BY MIN(hts.income_per_bln)
        ";

        return $this->select($sql, $bindings);
    }

    public function getKesesuaianBidangKerja(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE hts.hub_bidang_kerja
                    WHEN 1 THEN 'Sangat Sesuai'
                    WHEN 2 THEN 'Sesuai'
                    WHEN 3 THEN 'Cukup Sesuai'
                    WHEN 4 THEN 'Tidak Sesuai'
                    ELSE 'Tidak Diketahui'
                END as name,
                COUNT(DISTINCT hts.id_reg_pd) as value
            FROM tracer.hasil_tracer_study hts
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = hts.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE hts.soft_delete = 0
              AND rp.id_sp = ?
              AND rp.tgl_keluar IS NOT NULL
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              AND hts.hub_bidang_kerja IS NOT NULL
              {$fakFilter}
            GROUP BY hts.hub_bidang_kerja
            ORDER BY hts.hub_bidang_kerja
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // LULUSAN PER FAKULTAS / JENJANG
    // =========================================

    public function getLulusanPerFakultas(array $semesters): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getLulusanPerJenjang(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                jp.nm_jenj_didik as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
            GROUP BY jp.nm_jenj_didik
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
