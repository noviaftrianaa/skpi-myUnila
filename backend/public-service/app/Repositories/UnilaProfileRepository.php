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
                    akred.tst_sk_akred_sp
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
                WHERE sp.soft_delete = 0
                    AND CAST(sp.id_sp AS VARCHAR(50)) = ?
            ";

            $result = DB::connection('sqlsrv')->select($sql, [self::UNILA_ID_SP]);

            if (empty($result)) {
                throw new \Exception('Unila profile not found in database');
            }

            // Attach UKT range from keuangan.daftar_ukt (proper tarif UKT, bukan
            // pdrd.kuliah_mhs.biaya_smt yg banyak nilai outlier non-UKT).
            $ukt = $this->getUktRange();
            $result[0]->min_biaya = $ukt['min'];
            $result[0]->max_biaya = $ukt['max'];
            $result[0]->ukt_tahun = $ukt['tahun'];
            $result[0]->ukt_sumber = $ukt['sumber'];
            $result[0]->ukt_golongan = $ukt['golongan'];

            return $result[0];
        } catch (\Exception $e) {
            // Re-throw exception to be handled by service layer
            throw $e;
        }
    }

    /**
     * Get UKT range + golongan breakdown dari keuangan.daftar_ukt.
     *
     * Filter:
     *   - soft_delete = 0
     *   - nominal > 0 (skip placeholder 0/null)
     *   - nama_kelas LIKE 'KELOMPOK %' (skip BIDIKMISI/KIP — beasiswa, bukan UKT mandiri)
     *   - tahun = latest tahun yang punya tarif KELOMPOK
     *
     * @return array{min:int|null, max:int|null, tahun:int|null, sumber:string, golongan:array}
     */
    private function getUktRange(): array
    {
        try {
            // Latest tahun yang punya tarif KELOMPOK (UKT mandiri)
            $tahunSql = "
                SELECT MAX(tahun) AS tahun
                FROM keuangan.daftar_ukt
                WHERE soft_delete = 0
                    AND nominal > 0
                    AND nama_kelas LIKE 'KELOMPOK %'
            ";
            $tahunRow = DB::connection('sqlsrv')->select($tahunSql);
            $tahun = $tahunRow[0]->tahun ?? null;

            if (!$tahun) {
                return [
                    'min' => null,
                    'max' => null,
                    'tahun' => null,
                    'sumber' => 'Sistem Informasi Keuangan Unila',
                    'golongan' => [],
                ];
            }

            // Range global tahun terbaru
            $rangeSql = "
                SELECT
                    MIN(nominal) AS min_n,
                    MAX(nominal) AS max_n
                FROM keuangan.daftar_ukt
                WHERE soft_delete = 0
                    AND nominal > 0
                    AND nama_kelas LIKE 'KELOMPOK %'
                    AND tahun = ?
            ";
            $rangeRow = DB::connection('sqlsrv')->select($rangeSql, [$tahun]);

            // Per-golongan breakdown (KELOMPOK I-VIII)
            $golonganSql = "
                SELECT
                    nama_kelas,
                    MIN(nominal) AS nominal_min,
                    MAX(nominal) AS nominal_max,
                    COUNT(*) AS jml_prodi
                FROM keuangan.daftar_ukt
                WHERE soft_delete = 0
                    AND nominal > 0
                    AND nama_kelas LIKE 'KELOMPOK %'
                    AND tahun = ?
                GROUP BY nama_kelas
                ORDER BY MIN(nominal)
            ";
            $golonganRows = DB::connection('sqlsrv')->select($golonganSql, [$tahun]);

            $golongan = array_map(function ($r) {
                return [
                    'nama_kelas' => $r->nama_kelas,
                    'nominal_min' => (int) $r->nominal_min,
                    'nominal_max' => (int) $r->nominal_max,
                    'jml_prodi' => (int) $r->jml_prodi,
                ];
            }, $golonganRows);

            return [
                'min' => isset($rangeRow[0]) ? (int) $rangeRow[0]->min_n : null,
                'max' => isset($rangeRow[0]) ? (int) $rangeRow[0]->max_n : null,
                'tahun' => (int) $tahun,
                'sumber' => 'Sistem Informasi Keuangan Unila (Simpedam) — sync via MyUnila Integrator',
                'golongan' => $golongan,
            ];
        } catch (\Exception $e) {
            // Schema atau data belum tersedia — return null range, frontend show "Memuat..."
            return [
                'min' => null,
                'max' => null,
                'tahun' => null,
                'sumber' => 'Sistem Informasi Keuangan Unila',
                'golongan' => [],
            ];
        }
    }
}
