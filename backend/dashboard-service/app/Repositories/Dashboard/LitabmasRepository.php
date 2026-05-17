<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class LitabmasRepository extends BaseRepository
{
    /**
     * Build EXISTS clause utk filter fakultas/prodi via sdm_anggota_litabmas → reg_ptk → sms.
     * Append bindings ke array yang di-pass by ref.
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
            SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
            INNER JOIN pdrd.reg_ptk rpt ON rpt.id_sdm = sal.id_sdm AND rpt.soft_delete = 0
                AND rpt.id_jns_keluar IS NULL AND CAST(rpt.id_sp AS VARCHAR(50)) = '" . self::UNILA_ID_SP . "'
            INNER JOIN pdrd.sms s ON s.id_sms = rpt.id_sms AND s.soft_delete = 0
            WHERE sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
              {$extra}
        )";
    }

    public function countPenelitian(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(*)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND l.jns_litabmas = 'L'
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$orgExists}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countPengabdian(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(*)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND l.jns_litabmas = 'M'
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$orgExists}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    public function getTrendLitabmas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;
        $bindings = [$startYear, $maxYear];
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            ),
            jns_ref AS (
                SELECT 'Penelitian' as label, 'L' as jns
                UNION ALL SELECT 'Pengabdian', 'M'
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                j.label as category,
                (
                    SELECT COUNT(*)
                    FROM pdrd.litabmas l
                    WHERE l.soft_delete = 0
                      AND l.jns_litabmas = j.jns
                      AND l.id_thn_kegiatan = y.yr
                      {$orgExists}
                ) as value
            FROM years y
            CROSS JOIN jns_ref j
            ORDER BY y.yr, j.label
        ";

        return $this->select($sql, $bindings);
    }

    public function getSumberDana(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN l.dana_dikti > 0 THEN 'DIKTI'
                    WHEN l.dana_pt > 0 THEN 'PT'
                    WHEN l.dana_institusi_lain > 0 THEN 'Institusi Lain'
                    ELSE 'Mandiri/Lainnya'
                END as name,
                COUNT(*) as value
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$orgExists}
            GROUP BY
                CASE
                    WHEN l.dana_dikti > 0 THEN 'DIKTI'
                    WHEN l.dana_pt > 0 THEN 'PT'
                    WHEN l.dana_institusi_lain > 0 THEN 'Institusi Lain'
                    ELSE 'Mandiri/Lainnya'
                END
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getSebaranFakultas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        // Filter di JOIN langsung (bukan EXISTS) karena query sudah pakai JOIN sms.
        $orgFilter = '';
        if ($prodi) {
            $orgFilter = ' AND s.id_sms = ?';
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $orgFilter = ' AND s.id_fak_unila = ?';
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT l.id_litabmas) as value,
                CASE l.jns_litabmas WHEN 'L' THEN 'Penelitian' ELSE 'Pengabdian' END as category
            FROM pdrd.litabmas l
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.sdm sdm ON sal.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$orgFilter}
            GROUP BY uo.nm_lemb, l.jns_litabmas
            ORDER BY uo.nm_lemb
        ";

        return $this->select($sql, $bindings);
    }

    public function getBidangFokus(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(kb.nm_kel_bidang, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM pdrd.litabmas l
            LEFT JOIN ref.kelompok_bidang kb ON l.id_kel_bidang = kb.id_kel_bidang
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              AND l.id_kel_bidang IS NOT NULL
              {$orgExists}
            GROUP BY kb.nm_kel_bidang
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getSkimKegiatan(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(sk.nm_skim, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM pdrd.litabmas l
            LEFT JOIN ref.skim_kegiatan sk ON l.id_skim = sk.id_skim
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              AND l.id_skim IS NOT NULL AND CAST(l.id_skim AS VARCHAR(50)) != ''
              {$orgExists}
            GROUP BY sk.nm_skim
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
