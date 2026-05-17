<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class PegawaiRepository extends BaseRepository
{
    /**
     * Tendik base: id_jns_sdm != 12 (bukan dosen)
     *
     * Filter chain untuk fakultas/prodi:
     * sdm → pdrd.reg_ptk → pdrd.sms s (LEFT JOIN ketika filter aktif).
     * Tendik yang tidak punya assignment ke prodi tertentu otomatis ter-exclude
     * ketika prodi diberikan (sesuai harapan: scope sempit = data sempit).
     * Untuk fakultas, LEFT JOIN sms dengan id_fak_unila yang sesuai.
     */

    /**
     * Build extra JOIN + WHERE fragment untuk filter fakultas/prodi.
     * Returns array [joinSql, whereSql] yang siap di-interpolate.
     * Append bindings ke array yang di-pass by ref.
     */
    private function buildOrgFilter(?string $fakultas, ?string $prodi, array &$bindings): array
    {
        if (!$fakultas && !$prodi) {
            return ['', ''];
        }
        $join = " INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 ";
        $where = '';
        if ($prodi) {
            $where = " AND s.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND s.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    public function countTotal(?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL match Beranda countTendik (1.116): SIKEP source.
        // Scoped (Dekan/Kaprodi) fallback ke pdrd karena SIKEP tidak punya kolom fakultas/prodi.
        if (!$fakultas && !$prodi) {
            try {
                return (int) $this->selectScalar(
                    "SELECT COUNT(*) FROM sikep.pegawai WHERE status='Aktif' AND jns_tenaga='Non Dosen'",
                    []
                );
            } catch (\Throwable $e) { /* fall-through */ }
        }
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildOrgFilter($fakultas, $prodi, $bindings);
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countPNS(?string $fakultas = null, ?string $prodi = null): int
    {
        if (!$fakultas && !$prodi) {
            try {
                return (int) $this->selectScalar(
                    "SELECT COUNT(*) FROM sikep.pegawai WHERE status='Aktif' AND jns_tenaga='Non Dosen' AND jns_pegawai='PNS'",
                    []
                );
            } catch (\Throwable $e) { /* fall-through */ }
        }
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildOrgFilter($fakultas, $prodi, $bindings);
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND ptk.id_stat_pegawai = 1
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    public function getStatusKepegawaian(?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: SIKEP (universal). Fallback pdrd untuk scoped.
        if (!$fakultas && !$prodi) {
            try {
                return $this->select("
                    SELECT jns_pegawai AS name, COUNT(*) AS value
                    FROM sikep.pegawai
                    WHERE status='Aktif' AND jns_tenaga='Non Dosen'
                    GROUP BY jns_pegawai
                    ORDER BY value DESC
                ", []);
            } catch (\Throwable $e) { /* fall-through */ }
        }
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN ptk.id_stat_pegawai = 1 THEN 'PNS'
                    WHEN ptk.id_stat_pegawai = 2 THEN 'PPPK'
                    ELSE 'Non-PNS'
                END as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$whereSql}
            GROUP BY
                CASE
                    WHEN ptk.id_stat_pegawai = 1 THEN 'PNS'
                    WHEN ptk.id_stat_pegawai = 2 THEN 'PPPK'
                    ELSE 'Non-PNS'
                END
            ORDER BY value DESC
        ";
        return $this->select($sql, $bindings);
    }

    public function getGenderUsia(?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: SIKEP (universal).
        if (!$fakultas && !$prodi) {
            try {
                return $this->select("
                    SELECT
                        CASE
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) < 30 THEN '20-29'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 39 THEN '30-39'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 49 THEN '40-49'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 59 THEN '50-59'
                            ELSE '60+'
                        END as ageGroup,
                        SUM(CASE WHEN jk LIKE 'L%' THEN 1 ELSE 0 END) as male,
                        SUM(CASE WHEN jk LIKE 'P%' THEN 1 ELSE 0 END) as female
                    FROM sikep.pegawai
                    WHERE status='Aktif' AND jns_tenaga='Non Dosen' AND tgl_lahir IS NOT NULL
                    GROUP BY
                        CASE
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) < 30 THEN '20-29'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 39 THEN '30-39'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 49 THEN '40-49'
                            WHEN DATEDIFF(YEAR, tgl_lahir, GETDATE()) <= 59 THEN '50-59'
                            ELSE '60+'
                        END
                    ORDER BY ageGroup
                ", []);
            } catch (\Throwable $e) { /* fall-through */ }
        }
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildOrgFilter($fakultas, $prodi, $bindings);

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
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$whereSql}
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

    public function getPendidikan(?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                jp.nm_jenj_didik as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            {$joinSql}
            INNER JOIN pdrd.rwy_pend_formal rpf ON rpf.id_sdm = sdm.id_sdm AND rpf.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON rpf.id_jenj_didik = jp.id_jenj_didik
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND rpf.id_jenj_didik = (
                  SELECT MAX(rpf2.id_jenj_didik)
                  FROM pdrd.rwy_pend_formal rpf2
                  WHERE rpf2.id_sdm = sdm.id_sdm AND rpf2.soft_delete = 0
              )
              {$whereSql}
            GROUP BY jp.nm_jenj_didik
            ORDER BY value DESC
        ";
        return $this->select($sql, $bindings);
    }

    public function getSebaranUnitKerja(): array
    {
        $sql = "
            SELECT
                ISNULL(uo.nm_lemb, 'Belum Terklasifikasi') as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            LEFT JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }
}
