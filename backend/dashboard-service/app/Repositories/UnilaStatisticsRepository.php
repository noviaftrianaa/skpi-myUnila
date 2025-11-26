<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

class UnilaStatisticsRepository
{
    /**
     * Get Universitas Lampung overall statistics
     *
     * @return object
     */
    public function getUnilaStatistics(): object
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Get total active mahasiswa
        $totalMahasiswa = $this->getTotalMahasiswa($activePeriod);

        // Get total dosen (aktif, tidak keluar)
        $totalDosen = $this->getTotalDosen($unilaIdSp);

        // Get total tendik (aktif, tidak keluar)
        $totalTendik = $this->getTotalTendik($unilaIdSp);

        // Get total fakultas (aktif, jenjang = 98 untuk fakultas)
        $totalFakultas = $this->getTotalFakultas($unilaIdSp);

        // Get total program pascasarjana (S2, S3)
        $totalPascasarjana = $this->getTotalPascasarjana($unilaIdSp);

        // Get total program studi (aktif)
        $totalProdi = $this->getTotalProdi($unilaIdSp);

        // Get total guru besar (jabatan fungsional tertentu)
        $totalGuruBesar = $this->getTotalGuruBesar($unilaIdSp);

        // Get total publikasi
        $totalPublikasi = $this->getTotalPublikasi($unilaIdSp);

        return (object) [
            'mahasiswa_aktif' => $totalMahasiswa,
            'dosen' => $totalDosen,
            'tendik' => $totalTendik,
            'fakultas' => $totalFakultas,
            'pascasarjana' => $totalPascasarjana,
            'program_studi' => $totalProdi,
            'guru_besar' => $totalGuruBesar,
            'publikasi' => $totalPublikasi,
            'periode' => $activePeriod,
        ];
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

    /**
     * Get total active mahasiswa
     *
     * @param string $periode
     * @return int
     */
    private function getTotalMahasiswa(string $periode): int
    {
        // Count distinct students who are active in the current semester
        // Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs = 'A' (per semester)
        // Tidak perlu filter pd.id_stat_mhs karena status master bisa berbeda
        $sql = "
            SELECT COUNT(DISTINCT pd.id_pd) AS total
            FROM pdrd.kuliah_mhs AS kmh
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
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
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$periode]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total dosen
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalDosen(string $idSp): int
    {
        // Count semua dosen yang terdaftar di prodi aktif (semua jenjang), hindari double count
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT COUNT(DISTINCT ptk.id_sdm) AS total
            FROM pdrd.reg_ptk AS ptk
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_fak_unila IS NOT NULL
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            WHERE ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$tahunAjaran, $idSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total tendik
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalTendik(string $idSp): int
    {
        // Get tendik from sikep.pegawai with status='Aktif'
        try {
            $sql = "
                SELECT COUNT(*) AS total
                FROM sikep.pegawai
                WHERE status = 'Aktif'
            ";

            $result = DB::connection('sqlsrv')->select($sql);

            return (int) ($result[0]->total ?? 0);
        } catch (\Exception $e) {
            // If sikep schema doesn't exist, fallback to old query
            $sql = "
                SELECT COUNT(DISTINCT sdm.id_sdm) AS total
                FROM pdrd.sdm AS sdm
                INNER JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                WHERE sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '13'
            ";

            $result = DB::connection('sqlsrv')->select($sql, [$idSp]);

            return (int) ($result[0]->total ?? 0);
        }
    }

    /**
     * Get total fakultas
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalFakultas(string $idSp): int
    {
        $sql = "
            SELECT COUNT(*) AS total
            FROM pdrd.sms AS sms
            WHERE sms.soft_delete = 0
                AND sms.id_jns_sms = '1'
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total pascasarjana (S2 + S3)
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalPascasarjana(string $idSp): int
    {
        $sql = "
            SELECT COUNT(*) AS total
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
                AND didik.nm_jenj_didik IN ('S2', 'S2 Terapan', 'S3', 'S3 Terapan', 'Sp-1', 'Sp-2')
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total program studi (aktif)
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalProdi(string $idSp): int
    {
        $sql = "
            SELECT COUNT(*) AS total
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                AND sms.id_jns_sms = '3'
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
                AND sms.id_fak_unila IS NOT NULL
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idSp]);

        return (int) ($result[0]->total ?? 0);
    }

    /**
     * Get total guru besar (Profesor)
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalGuruBesar(string $idSp): int
    {
        // Get guru besar from rwy_fungsional table (latest jabatan fungsional per dosen)
        // Use exact match 'Profesor' for consistency with DosenRepository
        try {
            $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

            $sql = "
                SELECT COUNT(DISTINCT sdm.id_sdm) AS total
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
                    AND jabfung.nm_jabfung LIKE 'Profesor%'
            ";

            $result = DB::connection('sqlsrv')->select($sql, [$idSp, $tahunAjaran]);

            return (int) ($result[0]->total ?? 0);
        } catch (\Exception $e) {
            // If table doesn't exist or error, return 0
            return 0;
        }
    }

    /**
     * Get total publikasi (5 years from active period)
     *
     * @param string $idSp
     * @return int
     */
    private function getTotalPublikasi(string $idSp): int
    {
        try {
            // Get active period to calculate year range
            $activePeriod = $this->getActivePeriod();
            $activeYear = (int) substr($activePeriod, 0, 4); // Extract year from period (e.g., 20242 -> 2024)
            $startYear = $activeYear - 5; // 5 years back

            // Count publications from last 5 years based on tgl_terbit
            $sql = "
                SELECT COUNT(*) AS total
                FROM pdrd.publikasi AS pub
                INNER JOIN pdrd.tulis_pub AS tulis
                    ON tulis.id_publikasi = pub.id_publikasi
                    AND tulis.soft_delete = 0
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = tulis.id_sdm
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                WHERE pub.soft_delete = 0
                    AND pub.tgl_terbit IS NOT NULL
                    AND YEAR(pub.tgl_terbit) >= ?
                    AND YEAR(pub.tgl_terbit) <= ?
            ";

            $result = DB::connection('sqlsrv')->select($sql, [$idSp, $startYear, $activeYear]);
            return (int) ($result[0]->total ?? 0);
        } catch (\Exception $e) {
            // If table doesn't exist or error, return 0
            return 0;
        }
    }
}
