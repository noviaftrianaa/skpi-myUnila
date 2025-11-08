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
}
