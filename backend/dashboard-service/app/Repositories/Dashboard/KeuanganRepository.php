<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class KeuanganRepository extends BaseRepository
{
    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Total pembayaran UKT for given semesters
     */
    public function getTotalPendapatanUKT(array $semesters): float
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 0);
    }

    /**
     * Total tagihan SPP for given semesters
     */
    public function getTotalTagihanSPP(array $semesters): float
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 0);
    }

    // =========================================
    // TREND PENDAPATAN (5 tahun)
    // =========================================

    public function getTrendPendapatan(array $semesters): array
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
                ISNULL((
                    SELECT SUM(CAST(sm.nominal AS FLOAT))
                    FROM keuangan.spp_mhs sm
                    WHERE sm.soft_delete = 0
                      AND LEFT(CAST(sm.id_smt AS VARCHAR), 4) = CAST(y.yr AS VARCHAR)
                ), 0) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, [$startYear, $maxYear]);
    }

    // =========================================
    // STATUS PEMBAYARAN (PieChart)
    // =========================================

    public function getStatusPembayaran(array $semesters): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT
                ISNULL(sm.flag_by, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
            GROUP BY sm.flag_by
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SEBARAN KELAS UKT (BarChart)
    // =========================================

    public function getSebaranKelasUKT(array $semesters): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT
                ISNULL(ku.nm_kelas_ukt, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM keuangan.spp_mhs sm
            LEFT JOIN keuangan.kelas_ukt ku ON sm.id_kelas_ukt = ku.id_kelas_ukt
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
            GROUP BY ku.nm_kelas_ukt
            ORDER BY name
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TUNGGAKAN PER FAKULTAS (BarChart horizontal)
    // =========================================

    public function getTunggakanPerFakultas(array $semesters): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0) as value
            FROM keuangan.spp_mhs sm
            INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // KOMPOSISI PENDAPATAN per JALUR (PieChart)
    // =========================================

    public function getKomposisiPerJalur(array $semesters): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT
                ISNULL(jd.nm_jalur_daftar, 'Tidak Diketahui') as name,
                ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0) as value
            FROM keuangan.spp_mhs sm
            INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            LEFT JOIN ref.jalur_daftar jd ON rp.id_jalur_daftar = jd.id_jalur_daftar
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
            GROUP BY jd.nm_jalur_daftar
            HAVING SUM(CAST(sm.nominal AS FLOAT)) > 0
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
