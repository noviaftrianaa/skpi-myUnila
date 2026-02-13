<?php

namespace App\Repositories;

class ReferenceRepository extends BaseRepository
{
    /**
     * Get list of fakultas (level_organisasi = 2 = Fakultas)
     */
    public function getFakultasList(): array
    {
        $sql = "
            SELECT DISTINCT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id,
                uo.nm_lemb as nama
            FROM man_akses.unit_organisasi uo
            INNER JOIN pdrd.sms s ON s.id_fak_unila = uo.id_organisasi
            WHERE uo.soft_delete = 0
              AND s.soft_delete = 0
              AND s.id_sp = ?
              AND s.stat_prodi = 'A'
            ORDER BY uo.nm_lemb
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    /**
     * Get list of prodi, optionally filtered by fakultas
     */
    public function getProdiList(?string $idFakultas = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakultasFilter = "";

        if ($idFakultas) {
            $fakultasFilter = " AND s.id_fak_unila = ?";
            $bindings[] = $idFakultas;
        }

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id,
                CONCAT(jp.nm_jenj_didik, ' - ', s.nm_lemb) as nama,
                jp.nm_jenj_didik as jenjang,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas
            FROM pdrd.sms s
            LEFT JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            WHERE s.id_sp = ?
              AND s.soft_delete = 0
              AND s.stat_prodi = 'A'
              {$fakultasFilter}
            ORDER BY jp.nm_jenj_didik, s.nm_lemb
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Get list of semester/tahun ajaran (last 10 years)
     */
    public function getSemesterList(): array
    {
        $sql = "
            SELECT
                CAST(id_smt AS VARCHAR(5)) as id_smt,
                nm_smt,
                smt,
                ISNULL(a_periode_aktif, 0) as a_periode_aktif
            FROM ref.semester
            WHERE expired_date IS NULL
              AND smt != 3
              AND CAST(LEFT(id_smt, 4) AS INT) >= YEAR(GETDATE()) - 10
              AND CAST(LEFT(id_smt, 4) AS INT) <= YEAR(GETDATE()) + 1
            ORDER BY id_smt DESC
        ";

        return $this->select($sql);
    }
}
