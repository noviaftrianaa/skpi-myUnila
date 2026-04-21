<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class MahasiswaStatisticsRepository
{
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
     * Nama semester dari ref.semester (e.g. "2025/2026 Ganjil")
     */
    private function getSemesterName(string $idSmt): ?string
    {
        $row = DB::connection('sqlsrv')->selectOne(
            "SELECT TOP 1 nm_smt FROM ref.semester WHERE id_smt = ?",
            [$idSmt]
        );
        return $row->nm_smt ?? null;
    }

    /**
     * Timestamp data terakhir di-sync ke pdut untuk semester tsb
     */
    private function getLastUpdate(string $idSmt): ?string
    {
        $row = DB::connection('sqlsrv')->selectOne(
            "SELECT MAX(last_update) AS last_update FROM pdrd.kuliah_mhs WHERE id_smt = ? AND soft_delete = 0",
            [$idSmt]
        );
        return $row->last_update ?? null;
    }

    /**
     * Get active year from period
     *
     * @param string $period
     * @return int
     */
    private function getYearFromPeriod(string $period): int
    {
        return (int) substr($period, 0, 4);
    }

    /**
     * Get mahasiswa aktif trend for last 5 years
     * Based on tahun ajaran (academic year)
     *
     * @return array
     */
    public function getMahasiswaAktifTrend(): array
    {
        $activePeriod = $this->getActivePeriod();
        $activeYear = $this->getYearFromPeriod($activePeriod);
        $startYear = $activeYear - 4; // 5 years including current

        // Query untuk mendapatkan jumlah mahasiswa aktif per tahun ajaran
        // Menggunakan semester ganjil (1) sebagai representasi tahun ajaran
        $sql = "
            SELECT
                LEFT(kmh.id_smt, 4) AS tahun,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
                AND RIGHT(kmh.id_smt, 1) = '1'  -- Semester ganjil only for yearly trend
                AND LEFT(kmh.id_smt, 4) >= ?
                AND LEFT(kmh.id_smt, 4) <= ?
            GROUP BY LEFT(kmh.id_smt, 4)
            ORDER BY tahun ASC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$startYear, $activeYear]);

        return array_map(function($item) {
            return [
                'tahun' => $item->tahun,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by jenjang pendidikan
     *
     * @return array
     */
    public function getSebaranByJenjang(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                didik.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            GROUP BY didik.nm_jenj_didik
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'jenjang' => $item->jenjang,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by status (from kuliah_mhs)
     * Hanya menampilkan status yang memiliki data mahasiswa
     * Kecuali status "LULUS" karena parameter lulus dihitung terpisah
     *
     * @return array
     */
    public function getSebaranByStatus(): array
    {
        $activePeriod = $this->getActivePeriod();

        // Query untuk menampilkan status yang memiliki data saja
        // Kecuali status LULUS (id_stat_mhs = 'L') karena dihitung terpisah
        $sql = "
            SELECT
                sm.nm_stat_mhs AS status,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.status_mahasiswa AS sm
                ON sm.id_stat_mhs = kmh.id_stat_mhs
            WHERE kmh.soft_delete = 0
                AND kmh.id_smt = ?
                AND kmh.id_stat_mhs <> 'L'
            GROUP BY sm.nm_stat_mhs
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'status' => $item->status ?? 'Tidak Diketahui',
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by jenis kelamin
     *
     * @return array
     */
    public function getSebaranByJenisKelamin(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                CASE
                    WHEN pd.jk = 'L' THEN 'Laki-laki'
                    WHEN pd.jk = 'P' THEN 'Perempuan'
                    ELSE 'Tidak Diketahui'
                END AS jenis_kelamin,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            GROUP BY pd.jk
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'jenis_kelamin' => $item->jenis_kelamin,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by jalur daftar
     *
     * @return array
     */
    public function getSebaranByJalurDaftar(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                COALESCE(jd.nm_jalur_daftar, 'Tidak Diketahui') AS jalur_daftar,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.jalur_daftar AS jd
                ON jd.id_jalur_daftar = reg.id_jalur_daftar
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
            GROUP BY jd.nm_jalur_daftar
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'jalur_daftar' => $item->jalur_daftar,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by jenis pendaftaran
     *
     * @return array
     */
    public function getSebaranByJenisPendaftaran(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                COALESCE(jp.nm_jns_daftar, 'Tidak Diketahui') AS jenis_pendaftaran,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.jenis_pendaftaran AS jp
                ON jp.id_jns_daftar = reg.id_jns_daftar
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
            GROUP BY jp.nm_jns_daftar
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'jenis_pendaftaran' => $item->jenis_pendaftaran,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa by pembiayaan
     *
     * @return array
     */
    public function getSebaranByPembiayaan(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                COALESCE(pb.nm_pembiayaan, 'Tidak Diketahui') AS pembiayaan,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.pembiayaan AS pb
                ON pb.id_pembiayaan = reg.id_pembiayaan
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
            GROUP BY pb.nm_pembiayaan
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'pembiayaan' => $item->pembiayaan,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get sebaran mahasiswa asing (non-Indonesian)
     *
     * @return array
     */
    public function getSebaranMahasiswaAsing(): array
    {
        $activePeriod = $this->getActivePeriod();

        // Query untuk mendapatkan mahasiswa asing berdasarkan id_negara di ref.wilayah
        $sql = "
            SELECT
                COALESCE(negara.nm_negara, 'Tidak Diketahui') AS negara,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            LEFT JOIN ref.negara AS negara
                ON negara.id_negara = wil.id_negara
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
                AND wil.id_negara IS NOT NULL
                AND wil.id_negara <> 'ID'
            GROUP BY negara.nm_negara
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'negara' => $item->negara,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get total mahasiswa lokal vs asing
     *
     * @return array
     */
    public function getTotalLokalVsAsing(): array
    {
        $activePeriod = $this->getActivePeriod();

        $sql = "
            SELECT
                CASE
                    WHEN wil.id_negara = 'ID' OR wil.id_negara IS NULL THEN 'Lokal'
                    ELSE 'Asing'
                END AS kategori,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
            GROUP BY
                CASE
                    WHEN wil.id_negara = 'ID' OR wil.id_negara IS NULL THEN 'Lokal'
                    ELSE 'Asing'
                END
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$activePeriod]);

        return array_map(function($item) {
            return [
                'kategori' => $item->kategori,
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
            ];
        }, $result);
    }

    /**
     * Get combined statistics summary
     *
     * @return array
     */
    public function getStatisticsSummary(): array
    {
        $activePeriod = $this->getActivePeriod();

        // Total mahasiswa aktif
        $sqlTotal = "
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

        $totalResult = DB::connection('sqlsrv')->select($sqlTotal, [$activePeriod]);
        $totalMahasiswa = (int) ($totalResult[0]->total ?? 0);

        // Total mahasiswa asing
        $sqlAsing = "
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
                AND wil.id_negara IS NOT NULL
                AND wil.id_negara <> 'ID'
        ";

        $asingResult = DB::connection('sqlsrv')->select($sqlAsing, [$activePeriod]);
        $totalAsing = (int) ($asingResult[0]->total ?? 0);

        return [
            'total_mahasiswa_aktif' => $totalMahasiswa,
            'total_mahasiswa_lokal' => $totalMahasiswa - $totalAsing,
            'total_mahasiswa_asing' => $totalAsing,
            'periode' => $activePeriod,
            'periode_nama' => $this->getSemesterName($activePeriod),
            'last_update' => $this->getLastUpdate($activePeriod),
            'formula' => "COUNT(DISTINCT id_pd) WHERE id_stat_mhs='A' AND id_smt={$activePeriod} AND sms.stat_prodi='A'",
            'sumber' => 'pdut (pdrd.kuliah_mhs) — sumber utama realtime',
            'note' => 'Semester aktif ditentukan dari ref.semester.a_periode_aktif=1. Semester berikutnya akan muncul setelah admin pdut flip flag.',
        ];
    }
}
