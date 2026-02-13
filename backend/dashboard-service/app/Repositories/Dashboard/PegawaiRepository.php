<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class PegawaiRepository extends BaseRepository
{
    /**
     * Tendik base: id_jns_sdm != 12 (bukan dosen)
     */

    public function countTotal(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        ";
        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function countPNS(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND ptk.id_stat_pegawai = 1
        ";
        return (int) $this->selectScalar($sql, [self::UNILA_ID_SP]);
    }

    public function getStatusKepegawaian(): array
    {
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
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            GROUP BY
                CASE
                    WHEN ptk.id_stat_pegawai = 1 THEN 'PNS'
                    WHEN ptk.id_stat_pegawai = 2 THEN 'PPPK'
                    ELSE 'Non-PNS'
                END
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    public function getGenderUsia(): array
    {
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
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm != 12
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
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
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    public function getPendidikan(): array
    {
        $sql = "
            SELECT
                jp.nm_jenj_didik as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
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
            GROUP BY jp.nm_jenj_didik
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    public function getSebaranUnitKerja(): array
    {
        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
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
