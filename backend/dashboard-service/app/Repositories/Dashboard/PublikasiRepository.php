<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class PublikasiRepository extends BaseRepository
{
    /**
     * Build EXISTS clause utk filter fakultas/prodi via tulis_pub → sdm → reg_ptk → sms.
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
            SELECT 1 FROM pdrd.tulis_pub tp
            INNER JOIN pdrd.reg_ptk rpt ON rpt.id_sdm = tp.id_sdm AND rpt.soft_delete = 0
                AND rpt.id_jns_keluar IS NULL AND CAST(rpt.id_sp AS VARCHAR(50)) = '" . self::UNILA_ID_SP . "'
            INNER JOIN pdrd.sms s ON s.id_sms = rpt.id_sms AND s.soft_delete = 0
            WHERE tp.id_publikasi = p.id_publikasi AND tp.soft_delete = 0
              {$extra}
        )";
    }

    public function countTotal(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(*)
            FROM pdrd.publikasi p
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
              {$orgExists}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    public function getTrendPublikasi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
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
                (
                    SELECT COUNT(*)
                    FROM pdrd.publikasi p
                    WHERE p.soft_delete = 0
                      AND YEAR(p.tgl_terbit) = y.yr
                      {$orgExists}
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    public function getJenisPublikasi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(jp.nm_jns_pub, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM pdrd.publikasi p
            LEFT JOIN ref.jenis_publikasi jp ON p.id_jns_pub = jp.id_jns_pub
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
              {$orgExists}
            GROUP BY jp.nm_jns_pub
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getTopAuthors(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $orgExists = $this->buildOrgExists($fakultas, $prodi, $bindings);

        $sql = "
            SELECT TOP 10
                sdm.nm_sdm as name,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN pdrd.tulis_pub tp2 ON tp2.id_publikasi = p.id_publikasi AND tp2.soft_delete = 0
            INNER JOIN pdrd.sdm sdm ON tp2.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
              {$orgExists}
            GROUP BY sdm.nm_sdm
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getPerFakultas(array $semesters): array
    {
        // ANCHOR strategy: 1 publikasi = 1 fakultas (first author by urutan ASC).
        // Sebelumnya multi-author counted (lintas-fak duplicate entries).
        // SUM(perFakultas) ≈ total publikasi (selisih = author sudah keluar dari Unila).
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            ;WITH anchor AS (
                SELECT tp.id_publikasi, tp.id_sdm,
                    ROW_NUMBER() OVER (PARTITION BY tp.id_publikasi
                        ORDER BY ISNULL(tp.urutan, 999), tp.create_date) AS rn
                FROM pdrd.tulis_pub tp
                WHERE tp.soft_delete = 0 AND tp.id_sdm IS NOT NULL
            )
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN anchor a ON a.id_publikasi = p.id_publikasi AND a.rn = 1
            INNER JOIN pdrd.sdm sdm ON a.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }
}
