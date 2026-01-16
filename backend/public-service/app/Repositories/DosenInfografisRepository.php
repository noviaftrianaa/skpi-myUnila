<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

class DosenInfografisRepository
{
    /**
     * Get heatmap data: Jenjang Pendidikan vs Jabatan Fungsional
     *
     * @return array
     */
    public function getHeatmapPendidikanJabfung(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END AS jenjang_pendidikan,
                COALESCE(
                    CASE
                        WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                            RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                        ELSE
                            jabfung.nm_jabfung
                    END,
                    'Belum Ada Jabatan'
                ) AS jabatan_fungsional,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    id_sdm,
                    id_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY CAST(id_jenj_didik AS INT) DESC) AS rn
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
            ) AS rwy ON rwy.id_sdm = sdm.id_sdm AND rwy.rn = 1
            LEFT JOIN ref.jenjang_pendidikan AS pend
                ON pend.id_jenj_didik = rwy.id_jenj_didik
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END,
                CASE
                    WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                        RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                    ELSE
                        jabfung.nm_jabfung
                END
            ORDER BY jenjang_pendidikan, jabatan_fungsional
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'jenjang' => $item->jenjang_pendidikan,
                'jabatan' => $item->jabatan_fungsional,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get heatmap data: Kelompok Usia vs Jenjang Pendidikan
     *
     * @return array
     */
    public function getHeatmapUsiaPendidikan(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END AS kelompok_usia,
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END AS jenjang_pendidikan,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    id_sdm,
                    id_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY CAST(id_jenj_didik AS INT) DESC) AS rn
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
            ) AS rwy ON rwy.id_sdm = sdm.id_sdm AND rwy.rn = 1
            LEFT JOIN ref.jenjang_pendidikan AS pend
                ON pend.id_jenj_didik = rwy.id_jenj_didik
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND sdm.tgl_lahir IS NOT NULL
            GROUP BY
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END,
                CASE
                    WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
                    WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
                    WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
                    ELSE 'Lainnya'
                END
            ORDER BY kelompok_usia, jenjang_pendidikan
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'usia' => $item->kelompok_usia,
                'jenjang' => $item->jenjang_pendidikan,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get heatmap data: Kelompok Usia vs Jabatan Fungsional
     *
     * @return array
     */
    public function getHeatmapUsiaJabfung(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END AS kelompok_usia,
                COALESCE(
                    CASE
                        WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                            RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                        ELSE
                            jabfung.nm_jabfung
                    END,
                    'Belum Ada Jabatan'
                ) AS jabatan_fungsional,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND sdm.tgl_lahir IS NOT NULL
            GROUP BY
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END,
                CASE
                    WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                        RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                    ELSE
                        jabfung.nm_jabfung
                END
            ORDER BY kelompok_usia, jabatan_fungsional
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'usia' => $item->kelompok_usia,
                'jabatan' => $item->jabatan_fungsional,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get heatmap data: Ikatan Kerja vs Status Pegawai
     *
     * @return array
     */
    public function getHeatmapIkatanStatus(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                CASE
                    WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 'Dosen Tetap'
                    WHEN ptk.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
                    ELSE 'Lainnya'
                END AS ikatan_kerja,
                CASE
                    WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 'PNS'
                    ELSE 'Non-PNS'
                END AS status_pegawai,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY
                CASE
                    WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 'Dosen Tetap'
                    WHEN ptk.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
                    ELSE 'Lainnya'
                END,
                CASE
                    WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 'PNS'
                    ELSE 'Non-PNS'
                END
            ORDER BY ikatan_kerja, status_pegawai
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'ikatan' => $item->ikatan_kerja,
                'status' => $item->status_pegawai,
                'jumlah' => (int) $item->jumlah,
            ];
        }, $result);
    }

    /**
     * Get sertifikasi per jabatan fungsional (untuk diverging bar chart)
     *
     * @return array
     */
    public function getSertifikasiPerJabfung(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                COALESCE(
                    CASE
                        WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                            RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                        ELSE
                            jabfung.nm_jabfung
                    END,
                    'Belum Ada Jabatan'
                ) AS jabatan_fungsional,
                SUM(CASE WHEN sert.id_sdm IS NOT NULL THEN 1 ELSE 0 END) AS sudah_sertifikasi,
                SUM(CASE WHEN sert.id_sdm IS NULL THEN 1 ELSE 0 END) AS belum_sertifikasi
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            LEFT JOIN (
                SELECT DISTINCT id_sdm
                FROM pdrd.rwy_sertifikasi
                WHERE soft_delete = 0
            ) AS sert ON sert.id_sdm = sdm.id_sdm
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY
                CASE
                    WHEN jabfung.nm_jabfung LIKE '%(%' THEN
                        RTRIM(SUBSTRING(jabfung.nm_jabfung, 1, CHARINDEX('(', jabfung.nm_jabfung) - 1))
                    ELSE
                        jabfung.nm_jabfung
                END
            ORDER BY jabatan_fungsional
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'jabatan' => $item->jabatan_fungsional,
                'sudah' => (int) $item->sudah_sertifikasi,
                'belum' => (int) $item->belum_sertifikasi,
            ];
        }, $result);
    }

    /**
     * Get gender dan usia distribution (untuk population pyramid)
     *
     * @return array
     */
    public function getGenderUsia(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END AS kelompok_usia,
                SUM(CASE WHEN sdm.jk = 'L' THEN 1 ELSE 0 END) AS laki_laki,
                SUM(CASE WHEN sdm.jk = 'P' THEN 1 ELSE 0 END) AS perempuan
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND sdm.tgl_lahir IS NOT NULL
            GROUP BY
                CASE
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) < 30 THEN '< 30'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59'
                    WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) >= 60 THEN '60+'
                    ELSE 'Tidak Diketahui'
                END
            ORDER BY kelompok_usia
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);

        return array_map(function($item) {
            return [
                'usia' => $item->kelompok_usia,
                'laki_laki' => (int) $item->laki_laki,
                'perempuan' => (int) $item->perempuan,
            ];
        }, $result);
    }

    /**
     * Get tren sertifikasi dosen 5 tahun terakhir
     *
     * @return array
     */
    public function getTrenSertifikasi(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        // Get 5 years range
        $currentYear = (int) date('Y');
        $years = [];
        for ($i = 4; $i >= 0; $i--) {
            $years[] = $currentYear - $i;
        }

        $sql = "
            SELECT
                sert.thn_sert AS tahun,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.rwy_sertifikasi AS sert
                ON sert.id_sdm = sdm.id_sdm
                AND sert.soft_delete = 0
                AND sert.thn_sert IS NOT NULL
                AND sert.thn_sert BETWEEN ? AND ?
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY sert.thn_sert
            ORDER BY sert.thn_sert
        ";

        $result = DB::connection('sqlsrv')->select($sql, [
            $unilaIdSp,
            $tahunAjaran,
            min($years),
            max($years)
        ]);

        // Map results to years
        $dataByYear = [];
        foreach ($result as $item) {
            $dataByYear[(int) $item->tahun] = (int) $item->jumlah;
        }

        // Build output with all years (fill 0 for missing years)
        $output = [];
        foreach ($years as $year) {
            $output[] = [
                'tahun' => (string) $year,
                'jumlah' => $dataByYear[$year] ?? 0,
            ];
        }

        return $output;
    }

    /**
     * Get tren jabatan fungsional dosen 5 tahun terakhir
     *
     * @return array
     */
    public function getTrenJabfung(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        // Get 5 years range
        $currentYear = (int) date('Y');
        $years = [];
        for ($i = 4; $i >= 0; $i--) {
            $years[] = $currentYear - $i;
        }

        $sql = "
            SELECT
                YEAR(rwy.tmt_sk_jabfung) AS tahun,
                COALESCE(
                    CASE
                        WHEN jab.nm_jabfung LIKE '%(%' THEN
                            RTRIM(SUBSTRING(jab.nm_jabfung, 1, CHARINDEX('(', jab.nm_jabfung) - 1))
                        ELSE
                            jab.nm_jabfung
                    END,
                    'Belum Ada Jabatan'
                ) AS jabatan_fungsional,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.rwy_fungsional AS rwy
                ON rwy.id_sdm = sdm.id_sdm
                AND rwy.soft_delete = 0
                AND rwy.tmt_sk_jabfung IS NOT NULL
                AND YEAR(rwy.tmt_sk_jabfung) BETWEEN ? AND ?
            LEFT JOIN ref.jabfung AS jab
                ON jab.id_jabfung = rwy.id_jabfung
                AND jab.expired_date IS NULL
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            GROUP BY
                YEAR(rwy.tmt_sk_jabfung),
                CASE
                    WHEN jab.nm_jabfung LIKE '%(%' THEN
                        RTRIM(SUBSTRING(jab.nm_jabfung, 1, CHARINDEX('(', jab.nm_jabfung) - 1))
                    ELSE
                        jab.nm_jabfung
                END
            ORDER BY tahun, jabatan_fungsional
        ";

        $result = DB::connection('sqlsrv')->select($sql, [
            $unilaIdSp,
            $tahunAjaran,
            min($years),
            max($years)
        ]);

        // Group by year
        $dataByYear = [];
        foreach ($result as $item) {
            $year = (int) $item->tahun;
            $jabatan = $item->jabatan_fungsional;
            if (!isset($dataByYear[$year])) {
                $dataByYear[$year] = [];
            }
            $dataByYear[$year][$jabatan] = (int) $item->jumlah;
        }

        // Jabatan list for consistency
        $jabatanList = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor'];

        // Build output
        $output = [];
        foreach ($years as $year) {
            $yearData = [
                'tahun' => (string) $year,
            ];
            foreach ($jabatanList as $jabatan) {
                $key = str_replace(' ', '_', strtolower($jabatan));
                $yearData[$key] = $dataByYear[$year][$jabatan] ?? 0;
            }
            $output[] = $yearData;
        }

        return $output;
    }
}
