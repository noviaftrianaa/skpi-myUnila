<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class KeuanganRepository extends BaseRepository
{
    /**
     * Build EXISTS clause utk filter fakultas/prodi via reg_pd → sms.
     * Dipakai utk method yang basis-table-nya keuangan.spp_mhs alias `sm`
     * (belum JOIN reg_pd langsung).
     */
    private function buildOrgExists(?string $fakultas, ?string $prodi, array &$bindings): string
    {
        if (!$fakultas && !$prodi) return '';
        $extra = '';
        if ($prodi) {
            $extra .= ' AND s.id_sms = ?';
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $extra .= ' AND s.id_fak_unila = ?';
            $bindings[] = $fakultas;
        }
        return " AND EXISTS (
            SELECT 1 FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_reg_pd = sm.id_reg_pd AND rp.soft_delete = 0
              {$extra}
        )";
    }

    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Total pembayaran UKT for given semesters
     */
    public function getTotalPendapatanUKT(array $semesters, ?string $fakultas = null, ?string $prodi = null): float
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgExists}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 0);
    }

    /**
     * Total tagihan SPP for given semesters
     */
    public function getTotalTagihanSPP(array $semesters, ?string $fakultas = null, ?string $prodi = null): float
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgExists}
        ";

        return round((float) $this->selectScalar($sql, $bindings), 0);
    }

    // =========================================
    // TREND PENDAPATAN (5 tahun)
    // =========================================

    public function getTrendPendapatan(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [$startYear, $maxYear];
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

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
                      {$orgExists}
                ), 0) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // STATUS PEMBAYARAN (PieChart)
    // =========================================

    public function getStatusPembayaran(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(sm.flag_by, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgExists}
            GROUP BY sm.flag_by
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SEBARAN KELAS UKT (BarChart)
    // =========================================

    public function getSebaranKelasUKT(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // Sumber: spp_mhs.id_daftar_ukt → daftar_ukt.nama_kelas.
        // Fallback (kalau id_daftar_ukt NULL untuk sebagian besar baris): groupby nm_smt
        // supaya chart tidak kosong (kasus TA 2025 yg belum sync ke daftar_ukt).
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        // Join sms inline kalau perlu filter fakultas/prodi.
        $smsJoin = '';
        $orgFilter = '';
        if ($prodi) {
            $smsJoin = ' INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0';
            $orgFilter = ' AND rp.id_sms = ?';
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $smsJoin = ' INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0 INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0';
            $orgFilter = ' AND s.id_fak_unila = ?';
            $bindings[] = $fakultas;
        }

        // Coba ambil via daftar_ukt dulu.
        $sql = "
            SELECT
                du.nama_kelas as name,
                SUM(CAST(sm.nominal AS FLOAT)) as value
            FROM keuangan.spp_mhs sm
            INNER JOIN keuangan.daftar_ukt du ON du.id_daftar_ukt = sm.id_daftar_ukt
            {$smsJoin}
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY du.nama_kelas
            HAVING SUM(CAST(sm.nominal AS FLOAT)) > 0
            ORDER BY value DESC
        ";

        $rows = $this->select($sql, $bindings);
        if (!empty($rows)) return $rows;

        // Fallback: groupby semester (data belum punya kelas_ukt mapping).
        $sql2 = "
            SELECT
                ISNULL(sm.nm_smt, 'Tidak Diketahui') as name,
                SUM(CAST(sm.nominal AS FLOAT)) as value
            FROM keuangan.spp_mhs sm
            {$smsJoin}
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY sm.nm_smt
            HAVING SUM(CAST(sm.nominal AS FLOAT)) > 0
            ORDER BY value DESC
        ";
        return $this->select($sql2, $bindings);
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

    public function getKomposisiPerJalur(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        // Query already INNER JOINs reg_pd; filter via JOIN'd sms inline.
        $orgFilter = '';
        if ($prodi) {
            $orgFilter = ' AND s.id_sms = ?';
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $orgFilter = ' AND s.id_fak_unila = ?';
            $bindings[] = $fakultas;
        }

        // Tambah JOIN sms hanya jika perlu filter (hindari overhead saat tidak difilter).
        $smsJoin = ($prodi || $fakultas)
            ? ' INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0 '
            : '';

        $sql = "
            SELECT
                ISNULL(jd.nm_jalur_daftar, 'Tidak Diketahui') as name,
                ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0) as value
            FROM keuangan.spp_mhs sm
            INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            {$smsJoin}
            LEFT JOIN ref.jalur_daftar jd ON rp.id_jalur_daftar = jd.id_jalur_daftar
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY jd.nm_jalur_daftar
            HAVING SUM(CAST(sm.nominal AS FLOAT)) > 0
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
