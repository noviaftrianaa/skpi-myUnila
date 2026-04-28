<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class MahasiswaSebaranRepository
{
    /**
     * Get sebaran mahasiswa by kabupaten/kota
     * Ambil dari wilayah tingkat 2 (kabupaten/kota) langsung
     * Filter mahasiswa aktif berdasarkan semester aktif
     *
     * @return array
     */
    public function getSebaranMahasiswaByKabupaten(): array
    {
        // Methodology selaras dengan UnilaStatistics & ProgramStudi: INTERSECT
        // reg_pd ∩ peserta_didik dengan dedup ROW_NUMBER (1 student → 1 reg_pd
        // terbaru). Total sum di sini = 36,344 (verified pdut_staging).
        $sql = "
            SELECT TOP 100
                CASE
                    WHEN dedup.id_wil = '999999' OR dedup.id_wil IS NULL THEN '999999'
                    WHEN wil.id_level_wil = 2 THEN wil.id_wil
                    WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.id_wil, wil.id_wil)
                    ELSE COALESCE(wil.id_wil, '999999')
                END AS id_kabupaten,
                MAX(
                    CASE
                        WHEN dedup.id_wil = '999999' OR dedup.id_wil IS NULL THEN 'Wilayah Tidak Terdata'
                        WHEN wil.id_level_wil = 2 THEN wil.nm_wil
                        WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.nm_wil, wil.nm_wil)
                        ELSE COALESCE(wil.nm_wil, 'Wilayah Tidak Terdata')
                    END
                ) AS nama_kabupaten,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    pd.id_wil,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS didik
                    ON didik.id_jenj_didik = sms.id_jenj_didik
                    AND didik.expired_date IS NULL
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = dedup.id_wil
                AND wil.id_level_wil IN (2, 3)
            LEFT JOIN ref.wilayah AS wil_parent
                ON wil_parent.id_wil = wil.id_induk_wilayah
                AND wil_parent.id_level_wil = 2
            WHERE dedup.rn = 1
            GROUP BY
                CASE
                    WHEN dedup.id_wil = '999999' OR dedup.id_wil IS NULL THEN '999999'
                    WHEN wil.id_level_wil = 2 THEN wil.id_wil
                    WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.id_wil, wil.id_wil)
                    ELSE COALESCE(wil.id_wil, '999999')
                END
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        return array_map(function($item) {
            return [
                'id_kabupaten' => $item->id_kabupaten,
                'nama_kabupaten' => $item->nama_kabupaten,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by provinsi
     * Ambil dari wilayah tingkat 1 (provinsi) menggunakan substring kode wilayah
     *
     * @return array
     */
    public function getSebaranMahasiswaByProvinsi(): array
    {
        // INTERSECT methodology + ROW_NUMBER dedup (1 student → 1 reg_pd terbaru).
        $sql = "
            SELECT
                wil_prov.id_wil AS id_provinsi,
                wil_prov.nm_wil AS nama_provinsi,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    pd.id_wil,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            INNER JOIN ref.wilayah AS wil
                ON wil.id_wil = dedup.id_wil
                AND wil.id_wil IS NOT NULL
            INNER JOIN ref.wilayah AS wil_prov
                ON wil_prov.id_wil = SUBSTRING(CAST(wil.id_wil AS VARCHAR), 1, 2)
                AND wil_prov.id_level_wil = 1
            WHERE dedup.rn = 1
            GROUP BY wil_prov.id_wil, wil_prov.nm_wil
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        return array_map(function($item) {
            return [
                'id_provinsi' => $item->id_provinsi,
                'nama_provinsi' => $item->nama_provinsi,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by fakultas
     * Ambil jumlah mahasiswa aktif per fakultas
     *
     * @return array
     */
    public function getSebaranMahasiswaByFakultas(): array
    {
        // INTERSECT methodology + ROW_NUMBER dedup. Sum per-fakultas = 36,344.
        $sql = "
            SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    sms.id_fak_unila,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS didik
                    ON didik.id_jenj_didik = sms.id_jenj_didik
                    AND didik.expired_date IS NULL
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = dedup.id_fak_unila
                AND fak.soft_delete = 0
            WHERE dedup.rn = 1
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        return array_map(function($item) {
            return [
                'id_fakultas' => $item->id_fakultas,
                'nama_fakultas' => $item->nama_fakultas,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by prodi dalam fakultas
     * Ambil jumlah mahasiswa aktif per prodi dalam fakultas tertentu
     *
     * @param string $idFakultas
     * @return array
     */
    public function getSebaranMahasiswaByProdiInFakultas(string $idFakultas): array
    {
        // INTERSECT methodology + ROW_NUMBER dedup, scoped per-fakultas.
        $sql = "
            SELECT
                dedup.id_sms AS id_prodi,
                dedup.nm_lemb AS nama_prodi,
                dedup.nm_jenj_didik AS jenjang,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    sms.id_sms,
                    sms.nm_lemb,
                    jenj.nm_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                LEFT JOIN ref.jenjang_pendidikan AS jenj
                    ON jenj.id_jenj_didik = sms.id_jenj_didik
                    AND jenj.expired_date IS NULL
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
                    AND sms.id_fak_unila = ?
            ) AS dedup
            WHERE dedup.rn = 1
            GROUP BY dedup.id_sms, dedup.nm_lemb, dedup.nm_jenj_didik
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idFakultas]);

        return array_map(function($item) {
            return [
                'id_prodi' => $item->id_prodi,
                'nama_prodi' => $item->nama_prodi,
                'jenjang' => $item->jenjang,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get active period
     *
     * @return string
     */
    private function getActivePeriod(): string
    {
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        if (empty($result)) {
            $sql = "
                SELECT TOP 1 id_smt
                FROM ref.semester
                WHERE expired_date IS NULL
                    AND RIGHT(id_smt, 1) < '3'
                ORDER BY id_smt DESC
            ";
            $result = DB::connection('sqlsrv')->select($sql);
        }

        return $result[0]->id_smt ?? '20242';
    }
}
