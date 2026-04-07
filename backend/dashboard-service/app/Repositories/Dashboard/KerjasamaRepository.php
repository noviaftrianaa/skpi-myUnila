<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class KerjasamaRepository extends BaseRepository
{
    public function countTotalMitra(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT m.id_mou)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
        ";
        return (int) $this->selectScalar($sql, []);
    }

    public function countMouAktif(): int
    {
        $sql = "
            SELECT COUNT(*)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
        ";
        return (int) $this->selectScalar($sql, []);
    }

    public function getMitraByScope(): array
    {
        $sql = "
            SELECT
                ISNULL(ak.nm_akt_kerjasama, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM kerjasama.mou m
            LEFT JOIN ref.aktifitas_kerjasama ak ON CAST(m.id_akt_kerjasama AS VARCHAR) = CAST(ak.id_akt_kerjasama AS VARCHAR)
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
            GROUP BY ak.nm_akt_kerjasama
            ORDER BY value DESC
        ";
        return $this->select($sql, []);
    }

    public function getTrendKerjasama(array $semesters): array
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
                (SELECT COUNT(*) FROM kerjasama.mou m WHERE m.soft_delete = 0 AND YEAR(m.tgl_mulai) = y.yr) as value
            FROM years y
            ORDER BY y.yr
        ";
        return $this->select($sql, [$startYear, $maxYear]);
    }

    public function getMitraByType(): array
    {
        $sql = "
            SELECT
                ISNULL(m.nm_bu, 'Tidak Diketahui') as name,
                COUNT(*) as value
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
            GROUP BY m.nm_bu
            ORDER BY value DESC
        ";
        return $this->select($sql, []);
    }
}
