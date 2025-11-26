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
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Query sebaran mahasiswa per kabupaten/kota
        // Menggunakan query yang sama dengan UnilaStatistics untuk konsistensi (total 32,342)
        // JOIN dari kuliah_mhs -> reg_pd -> peserta_didik untuk filter semester aktif
        // Menggunakan self-join dengan id_induk_wilayah untuk mendapatkan kabupaten dari kecamatan
        // INCLUDE mahasiswa dengan id_wil '999999' (tidak terdata) agar total match dengan home page
        $sql = "
            SELECT TOP 100
                CASE
                    WHEN pd.id_wil = '999999' THEN '999999'
                    WHEN wil.id_level_wil = 2 THEN wil.id_wil
                    WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.id_wil, wil.id_wil)
                    ELSE COALESCE(wil.id_wil, '999999')
                END AS id_kabupaten,
                MAX(
                    CASE
                        WHEN pd.id_wil = '999999' THEN 'Wilayah Tidak Terdata'
                        WHEN wil.id_level_wil = 2 THEN wil.nm_wil
                        WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.nm_wil, wil.nm_wil)
                        ELSE COALESCE(wil.nm_wil, 'Wilayah Tidak Terdata')
                    END
                ) AS nama_kabupaten,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            -- Join ke reg_pd
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            -- Join ke peserta_didik
            -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            -- Join ke sms (program studi) untuk filter prodi aktif dan jenjang D/S
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            -- Join ke jenjang pendidikan untuk filter hanya D% dan S%
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            -- LEFT join ke wilayah (bisa level 2 atau 3, atau NULL untuk id_wil invalid)
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
                AND wil.id_level_wil IN (2, 3)  -- Hanya ambil level kabupaten dan kecamatan
            -- Self-join ke wilayah parent menggunakan id_induk_wilayah untuk mendapatkan kabupaten
            LEFT JOIN ref.wilayah AS wil_parent
                ON wil_parent.id_wil = wil.id_induk_wilayah
                AND wil_parent.id_level_wil = 2  -- Pastikan parent adalah level kabupaten
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'  -- Status aktif di semester berjalan
                AND kmh.id_smt = ?         -- Semester aktif
            GROUP BY
                CASE
                    WHEN pd.id_wil = '999999' THEN '999999'
                    WHEN wil.id_level_wil = 2 THEN wil.id_wil
                    WHEN wil.id_level_wil = 3 THEN COALESCE(wil_parent.id_wil, wil.id_wil)
                    ELSE COALESCE(wil.id_wil, '999999')
                END
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

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
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Query sebaran mahasiswa per provinsi
        // Join ke tabel wilayah untuk mendapatkan nama provinsi dari kode wilayah
        $sql = "
            SELECT
                wil_prov.id_wil AS id_provinsi,
                wil_prov.nm_wil AS nama_provinsi,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.peserta_didik AS pd
            -- Join ke wilayah (wilayah asal mahasiswa)
            INNER JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
                AND wil.id_wil IS NOT NULL
            -- Join ke wilayah provinsi dengan substring kode (2 digit pertama)
            INNER JOIN ref.wilayah AS wil_prov
                ON wil_prov.id_wil = SUBSTRING(CAST(wil.id_wil AS VARCHAR), 1, 2)
                AND wil_prov.id_level_wil = 1  -- Level provinsi
            -- Join ke reg_pd untuk filter status aktif
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            -- Join ke kuliah_mhs untuk filter semester aktif
            INNER JOIN pdrd.kuliah_mhs AS kmh
                ON kmh.id_reg_pd = reg.id_reg_pd
                AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'  -- Status aktif di semester berjalan
                AND kmh.id_smt = ?         -- Semester aktif
            WHERE pd.soft_delete = 0
                -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            GROUP BY wil_prov.id_wil, wil_prov.nm_wil
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

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
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Query sebaran mahasiswa per fakultas
        // Menggunakan self-join dari pdrd.sms untuk mendapatkan fakultas seperti di PenelitianRepository
        $sql = "
            SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            -- Join ke reg_pd
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            -- Join ke peserta_didik
            -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            -- Join ke sms (program studi)
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            -- Join ke jenjang pendidikan untuk filter hanya D% dan S%
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            -- Join to fakultas (self-join sms menggunakan id_fak_unila)
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'  -- Status aktif di semester berjalan
                AND kmh.id_smt = ?         -- Semester aktif
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

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
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Query sebaran mahasiswa per prodi dalam fakultas
        $sql = "
            SELECT
                sms.id_sms AS id_prodi,
                sms.nm_lemb AS nama_prodi,
                jenj.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            -- Join ke reg_pd
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            -- Join ke peserta_didik
            -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            -- Join ke sms (program studi)
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            -- Join ke jenjang pendidikan untuk filter hanya D% dan S%
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND (jenj.nm_jenj_didik LIKE 'D%' OR jenj.nm_jenj_didik LIKE 'S%')
            -- Filter by fakultas
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'  -- Status aktif di semester berjalan
                AND kmh.id_smt = ?         -- Semester aktif
                AND sms.id_fak_unila = ?   -- Filter fakultas
            GROUP BY sms.id_sms, sms.nm_lemb, jenj.nm_jenj_didik
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod, $idFakultas]);

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
