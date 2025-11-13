<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class UnilaProfileRepository
{
    /**
     * Universitas Lampung ID
     */
    private const UNILA_ID_SP = 'E2B705A7-173E-464A-9FAC-509128709515';

    /**
     * Get Unila profile information
     *
     * @return object
     */
    public function getUnilaProfile(): object
    {
        try {
            $sql = "
                SELECT
                    sp.id_sp,
                    sp.nm_lemb,
                    sp.nm_singkat,
                    sp.npsn,
                    sp.kode_pt,
                    sp.jln,
                    sp.ds_kel,
                    sp.kode_pos,
                    sp.no_tel,
                    sp.no_fax,
                    sp.email,
                    sp.website,
                    CASE
                        WHEN sp.stat_sp = 'A' THEN 'Unggul'
                        ELSE sp.stat_sp
                    END AS stat_sp,
                    sp.sk_pendirian_sp,
                    sp.tgl_sk_pendirian_sp,
                    sp.tgl_berdiri,
                    sp.luas_tanah_milik,
                    sp.luas_tanah_bukan_milik,
                    sp.npwp,
                    akred.nm_akred,
                    akred.sk_akred_sp,
                    akred.tgl_sk_akred_sp,
                    akred.tst_sk_akred_sp,
                    biaya.min_biaya,
                    biaya.max_biaya
                FROM pdrd.satuan_pendidikan AS sp
                LEFT JOIN (
                    SELECT
                        asp.id_sp,
                        na.nm_akred,
                        asp.sk_akred_sp,
                        asp.tgl_sk_akred_sp,
                        asp.tst_sk_akred_sp,
                        ROW_NUMBER() OVER (PARTITION BY asp.id_sp ORDER BY asp.tst_sk_akred_sp DESC) AS rn
                    FROM pdrd.akred_sp AS asp
                    JOIN ref.nilai_akred AS na
                        ON na.id_akred = asp.id_akred
                    WHERE asp.soft_delete = 0
                ) AS akred ON akred.id_sp = sp.id_sp AND akred.rn = 1
                LEFT JOIN (
                    SELECT
                        reg.id_sp,
                        MIN(km.biaya_smt) as min_biaya,
                        MAX(km.biaya_smt) as max_biaya
                    FROM pdrd.kuliah_mhs AS km
                    INNER JOIN pdrd.reg_pd AS reg
                        ON reg.id_reg_pd = km.id_reg_pd
                        AND reg.soft_delete = 0
                    WHERE km.soft_delete = 0
                        AND km.biaya_smt IS NOT NULL
                        AND km.biaya_smt >= 100000
                        AND km.biaya_smt <= 100000000
                    GROUP BY reg.id_sp
                ) AS biaya ON biaya.id_sp = sp.id_sp
                WHERE sp.soft_delete = 0
                    AND CAST(sp.id_sp AS VARCHAR(50)) = ?
            ";

            $result = DB::connection('sqlsrv')->select($sql, [self::UNILA_ID_SP]);

            if (empty($result)) {
                throw new \Exception('Unila profile not found in database');
            }

            return $result[0];
        } catch (\Exception $e) {
            // Re-throw exception to be handled by service layer
            throw $e;
        }
    }
}
