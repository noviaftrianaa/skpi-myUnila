<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BidangIlmuRepository
{
    /**
     * Get bidang ilmu for specific dosen by ID SDM
     * Uses recursive CTE to build hierarchical bidang ilmu names
     */
    public function getBidangIlmuByIdSdm(string $idSdm)
    {
        try {
            $bidangIlmu = DB::connection('sister')->select("
                WITH BidangHierarchy AS (
                    -- Base case: get the leaf node
                    SELECT
                        id_kel_bidang,
                        kode_kel_bidang,
                        nm_kel_bidang,
                        id_induk_bidang,
                        CAST(nm_kel_bidang AS VARCHAR(MAX)) as full_hierarchy,
                        0 as level
                    FROM ref.kelompok_bidang
                    WHERE id_kel_bidang IN (
                        SELECT id_kel_bidang FROM pdrd.map_sdm_bidang
                        WHERE id_sdm = ? AND soft_delete = 0
                    )

                    UNION ALL

                    -- Recursive case: traverse up to parent nodes
                    SELECT
                        kb.id_kel_bidang,
                        kb.kode_kel_bidang,
                        kb.nm_kel_bidang,
                        kb.id_induk_bidang,
                        CAST(kb.nm_kel_bidang + ' -- ' + bh.full_hierarchy AS VARCHAR(MAX)),
                        bh.level + 1
                    FROM ref.kelompok_bidang kb
                    INNER JOIN BidangHierarchy bh ON kb.id_kel_bidang = bh.id_induk_bidang
                )
                SELECT
                    msb.id_sdm,
                    s.nm_sdm as nama_dosen,
                    s.nidn,
                    msb.id_kel_bidang,
                    kb.kode_kel_bidang as kode_bidang,
                    CONCAT('[', kb.kode_kel_bidang, '] ',
                           (SELECT TOP 1 full_hierarchy
                            FROM BidangHierarchy
                            WHERE id_kel_bidang = msb.id_kel_bidang
                            ORDER BY level DESC)) as nama_bidang,
                    msb.urutan,
                    msb.last_sync
                FROM pdrd.map_sdm_bidang msb
                LEFT JOIN pdrd.sdm s ON msb.id_sdm = s.id_sdm
                LEFT JOIN ref.kelompok_bidang kb ON msb.id_kel_bidang = kb.id_kel_bidang
                WHERE msb.id_sdm = ?
                  AND msb.soft_delete = 0
                ORDER BY msb.urutan ASC
            ", [$idSdm, $idSdm]);

            return $bidangIlmu;
        } catch (\Exception $e) {
            Log::error('Error fetching bidang ilmu for dosen: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Search bidang ilmu by name with dosen count
     *
     * @param string $search
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function searchBidangIlmu(string $search = '', int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang,
                COUNT(DISTINCT msb.id_sdm) AS total_dosen
            FROM ref.kelompok_bidang AS kb
            LEFT JOIN pdrd.map_sdm_bidang AS msb
                ON msb.id_kel_bidang = kb.id_kel_bidang
                AND msb.soft_delete = 0
            WHERE kb.expired_date IS NULL
                AND kb.nm_kel_bidang LIKE ?
            GROUP BY
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang
            ORDER BY total_dosen DESC, kb.nm_kel_bidang ASC
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        ";

        return DB::connection('sister')->select($sql, ["%{$search}%", $offset, $limit]);
    }

    /**
     * Count total bidang ilmu matching search
     *
     * @param string $search
     * @return int
     */
    public function countBidangIlmu(string $search = ''): int
    {
        $sql = "
            SELECT COUNT(*) AS total
            FROM ref.kelompok_bidang AS kb
            WHERE kb.expired_date IS NULL
                AND kb.nm_kel_bidang LIKE ?
        ";

        $result = DB::connection('sister')->select($sql, ["%{$search}%"]);
        return $result[0]->total ?? 0;
    }

    /**
     * Get bidang ilmu basic info
     *
     * @param string $idKelBidang
     * @return object|null
     */
    public function getBidangIlmuInfo(string $idKelBidang): ?object
    {
        $sql = "
            SELECT
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang,
                kb.kat_kel,
                parent.nm_kel_bidang AS induk_bidang
            FROM ref.kelompok_bidang AS kb
            LEFT JOIN ref.kelompok_bidang AS parent
                ON parent.id_kel_bidang = kb.id_induk_bidang
                AND parent.expired_date IS NULL
            WHERE kb.id_kel_bidang = ?
                AND kb.expired_date IS NULL
        ";

        $result = DB::connection('sister')->select($sql, [$idKelBidang]);
        return !empty($result) ? $result[0] : null;
    }

    /**
     * Get list of dosen in this bidang ilmu
     *
     * @param string $idKelBidang
     * @return array
     */
    public function getDosenByBidangIlmu(string $idKelBidang): array
    {
        $sql = "
            WITH DosenWithProdi AS (
                SELECT
                    msb.id_sdm,
                    sdm.nm_sdm AS nama,
                    sdm.nidn,
                    sdm.nuptk,
                    sdm.jk,
                    msb.urutan,
                    jabfung.nm_jabfung,
                    sms.nm_lemb AS prodi,
                    jenj.nm_jenj_didik AS jenjang,
                    ROW_NUMBER() OVER (
                        PARTITION BY msb.id_sdm
                        ORDER BY
                            CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                            ptk.id_reg_ptk DESC
                    ) AS rn
                FROM pdrd.map_sdm_bidang AS msb
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = msb.id_sdm
                    AND sdm.soft_delete = 0
                LEFT JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms
                    ON sms.id_sms = ptk.id_sms
                    AND sms.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj
                    ON jenj.id_jenj_didik = sms.id_jenj_didik
                    AND jenj.expired_date IS NULL
                LEFT JOIN (
                    SELECT
                        rwy.id_sdm,
                        jab.nm_jabfung,
                        ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                    FROM pdrd.rwy_fungsional AS rwy
                    LEFT JOIN ref.jabfung AS jab
                        ON jab.id_jabfung = rwy.id_jabfung
                        AND jab.expired_date IS NULL
                    WHERE rwy.soft_delete = 0
                ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
                WHERE msb.id_kel_bidang = ?
                    AND msb.soft_delete = 0
            )
            SELECT
                id_sdm,
                nama,
                nidn,
                nuptk,
                CASE WHEN jk = 'L' THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis_kelamin,
                COALESCE(nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                COALESCE(prodi, 'Tidak Ada') AS prodi,
                COALESCE(jenjang, 'Tidak Ada') AS jenjang,
                urutan
            FROM DosenWithProdi
            WHERE rn = 1
            ORDER BY urutan ASC, nama ASC
        ";

        return DB::connection('sister')->select($sql, [$idKelBidang]);
    }
}
