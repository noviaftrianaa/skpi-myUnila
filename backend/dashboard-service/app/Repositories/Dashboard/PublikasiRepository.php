<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class PublikasiRepository extends BaseRepository
{
    public function countTotal(array $semesters): int
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

    public function getTopAuthors(array $semesters): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT TOP 10
                sdm.nm_sdm as name,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN pdrd.tulis_pub tp2 ON tp2.id_publikasi = p.id_publikasi AND tp2.soft_delete = 0
            INNER JOIN pdrd.sdm sdm ON tp2.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) IN {$inClause}
            GROUP BY sdm.nm_sdm
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getPerFakultas(array $semesters): array
    {
        $years = $this->extractYears($semesters);
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN pdrd.tulis_pub tp2 ON tp2.id_publikasi = p.id_publikasi AND tp2.soft_delete = 0
            INNER JOIN pdrd.sdm sdm ON tp2.id_sdm = sdm.id_sdm AND sdm.soft_delete = 0
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
