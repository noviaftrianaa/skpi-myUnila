<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class AkreditasiRepository
{
    public function getFakultas()
    {
        $sql = "
                SELECT
                fak.id_sms,
                fak.nm_lemb,
                COUNT(DISTINCT psms.id_sms) AS total_prodi,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'D3' THEN psms.id_sms END) AS jenjang_d3,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'D4' THEN psms.id_sms END) AS jenjang_d4,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S1' THEN psms.id_sms END) AS jenjang_s1,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S2' THEN psms.id_sms END) AS jenjang_s2,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S3' THEN psms.id_sms END) AS jenjang_s3,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Profesi' THEN psms.id_sms END) AS jenjang_profesi,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Sp-1' THEN psms.id_sms END) AS jenjang_sp1,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Sp-2' THEN psms.id_sms END) AS jenjang_sp2,
                SUM(
                    CASE

                        WHEN akred_prodi.tst_sk_akreditasi_prodi >= CAST (GETDATE() AS DATE)
                        AND akred_prodi.tst_sk_akreditasi_prodi < DATEADD(YEAR, 1, CAST (GETDATE() AS DATE)) THEN
                        1 ELSE 0
                        END) AS prodi_akan_kadaluarsa,
                    SUM(CASE WHEN CAST (GETDATE() AS DATE) BETWEEN akred_prodi.tanggal_sk_akreditasi_prodi AND akred_prodi.tst_sk_akreditasi_prodi THEN 1 ELSE 0 END) AS prodi_aktif
                    FROM
                    pdrd.sms AS psms
                    JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                    JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = psms.id_jenj_didik
                    AND didik.expired_date
                    IS NULL LEFT JOIN pdrd.akreditasi_prodi AS akred_prodi ON psms.id_sms = akred_prodi.id_sms
                    AND akred_prodi.soft_delete = 0
                    WHERE
                    psms.id_jns_sms = '3'
                    AND psms.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
                    AND psms.soft_delete = 0
                    AND psms.id_fak_unila IS NOT NULL
                          AND psms.stat_prodi = 'A'

                    GROUP BY
                    fak.id_sms,
                    fak.nm_lemb
        ";

        $data_akreditasi = collect(DB::select($sql))->map(function ($item) {
            $jenjang = [
                'D3'       => $item->jenjang_d3,
                'D4'       => $item->jenjang_d4,
                'S1'       => $item->jenjang_s1,
                'S2'       => $item->jenjang_s2,
                'S3'       => $item->jenjang_s3,
                'Profesi'  => $item->jenjang_profesi,
                'Sp-1'     => $item->jenjang_sp1,
                'Sp-2'     => $item->jenjang_sp2,
            ];

            return [
                "id"                    => $item->id_sms,
                "nama_lembaga"          => $item->nm_lemb,
                "total_prodi"           => $item->total_prodi,
                "jenjang_list"          => $jenjang,
                "prodi_akan_kadaluarsa" => $item->prodi_akan_kadaluarsa,
                "prodi_aktif"           => $item->prodi_aktif,
            ];
        });

        return $data_akreditasi;
    }
}
