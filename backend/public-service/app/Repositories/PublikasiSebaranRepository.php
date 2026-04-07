<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PublikasiSebaranRepository
{
    /**
     * Get sebaran publikasi by fakultas with ID
     *
     * @param int|null $startYear
     * @param int|null $endYear
     * @return array
     */
    public function getSebaranPublikasiByFakultas(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12' -- Dosen
            -- Get only latest reg_ptk per dosen (avoid duplicates)
            INNER JOIN (
                SELECT
                    id_sdm,
                    id_sms,
                    id_sp,
                    tgl_srt_tgs,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
                FROM pdrd.reg_ptk
                WHERE soft_delete = 0
                    AND id_jns_keluar IS NULL
            ) AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.rn = 1
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms_prodi
                ON sms_prodi.id_sms = ptk.id_sms
                AND sms_prodi.soft_delete = 0
                AND sms_prodi.stat_prodi = 'A'
            -- Join to fakultas (sms lagi menggunakan id_fak_unila)
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms_prodi.id_fak_unila
                AND fak.soft_delete = 0
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $startYear, $endYear]);

        return array_map(function ($item) {
            return [
                'id_fakultas' => $item->id_fakultas,
                'nama_fakultas' => $item->nama_fakultas,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get sebaran publikasi by prodi in fakultas
     *
     * @param string $idFakultas
     * @param int|null $startYear
     * @param int|null $endYear
     * @return array
     */
    public function getSebaranPublikasiByProdiInFakultas(string $idFakultas, ?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                sms_prodi.id_sms AS id_prodi,
                sms_prodi.nm_lemb AS nama_prodi,
                jp.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT p.id_publikasi) AS jumlah
            FROM pdrd.publikasi AS p
            INNER JOIN pdrd.tulis_pub AS tp
                ON tp.id_publikasi = p.id_publikasi
                AND tp.soft_delete = 0
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = tp.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12' -- Dosen
            -- Get only latest reg_ptk per dosen (avoid duplicates)
            INNER JOIN (
                SELECT
                    id_sdm,
                    id_sms,
                    id_sp,
                    tgl_srt_tgs,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
                FROM pdrd.reg_ptk
                WHERE soft_delete = 0
                    AND id_jns_keluar IS NULL
            ) AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.rn = 1
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms AS sms_prodi
                ON sms_prodi.id_sms = ptk.id_sms
                AND sms_prodi.soft_delete = 0
                AND sms_prodi.stat_prodi = 'A'
                AND sms_prodi.id_fak_unila = ?
            LEFT JOIN ref.jenjang_pendidikan AS jp
                ON jp.id_jenj_didik = sms_prodi.id_jenj_didik
                AND jp.expired_date IS NULL
            WHERE p.soft_delete = 0
                AND p.id_jns_pub != 9999
                AND p.tgl_terbit IS NOT NULL
                AND YEAR(p.tgl_terbit) >= ?
                AND YEAR(p.tgl_terbit) <= ?
            GROUP BY sms_prodi.id_sms, sms_prodi.nm_lemb, jp.nm_jenj_didik
            ORDER BY jumlah DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $idFakultas, $startYear, $endYear]);

        return array_map(function ($item) {
            return [
                'id_prodi' => $item->id_prodi,
                'nama_prodi' => $item->nama_prodi,
                'jenjang' => $item->jenjang ?? 'Umum',
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }
}
