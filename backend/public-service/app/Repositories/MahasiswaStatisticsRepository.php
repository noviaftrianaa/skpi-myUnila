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
        // Ambil semester aktif terbaru. Kalau ada >1 row a_periode_aktif=1
        // (mis. transisi Ganjil→Genap belum di-flip clean), pilih yang
        // paling akhir id_smt-nya.
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
            ORDER BY id_smt DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        if (empty($result)) {
            // Fallback: ambil semester pendaftaran/ganjil/genap terbaru
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
     * Ambil SEMUA id_smt di tahun ajaran berjalan (Ganjil + Genap + Pendek).
     * Pakai untuk kalkulasi "total mahasiswa aktif tahun ajaran X" — UNION
     * DISTINCT id_pd di kedua/ketiga semester. Best practice PDDIKTI Feeder
     * supaya mahasiswa yang sempat aktif di Ganjil tapi tidak di Genap
     * (mis. lulus di tengah TA) tetap dihitung di angka headline tahun ajaran.
     *
     * Kalau Genap belum sync penuh dari SIAKADU, query tetap aman karena
     * UNION + DISTINCT — kalkulasi otomatis pakai data Ganjil saja.
     *
     * @return string[] Format ['20251','20252'] atau ['20251','20252','20253']
     */
    private function getActiveAcademicYearPeriods(): array
    {
        $activePeriod = $this->getActivePeriod();
        $tahun = substr($activePeriod, 0, 4);
        // Semester ke-3 (Pendek) optional: kalau ada di ref.semester include juga.
        $sql = "
            SELECT id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
              AND LEFT(id_smt, 4) = ?
            ORDER BY id_smt
        ";
        $rows = DB::connection('sqlsrv')->select($sql, [$tahun]);
        $periods = array_map(fn($r) => $r->id_smt, $rows);
        return $periods ?: [$activePeriod];
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
     * Timestamp Feeder PDDIKTI sync terakhir — diambil dari MAX(last_update)
     * di reg_pd. Indikator data freshness untuk konsumen infografis.
     */
    private function getLastFeederSync(): ?string
    {
        $row = DB::connection('sqlsrv')->selectOne(
            "SELECT MAX(last_update) AS last_sync FROM pdrd.reg_pd WHERE soft_delete = 0"
        );
        return $row->last_sync ?? null;
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
                AND kmh.id_stat_mhs IN ('A', 'M')
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
        // ROW_NUMBER dedup → 1 student → latest reg_pd → satu jenjang.
        // SUM = total summary 36,344 (verified).
        $sql = "
            SELECT
                dedup.jenjang,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    didik.nm_jenj_didik AS jenjang,
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
            WHERE dedup.rn = 1
            GROUP BY dedup.jenjang
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
    public function getSebaranByStatus(?string $idSmt = null): array
    {
        // Status mahasiswa berubah per semester (A→C→A, M→A, dst). Query ini
        // tetap pakai kuliah_mhs supaya snapshot status per-semester akurat.
        // Default pakai semester aktif dari ref.semester. User bisa override
        // via ?id_smt=20251 untuk lihat status di semester lain.
        $activePeriod = $idSmt ?: $this->getActivePeriod();

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
     * List semester yang available untuk filter chart status mahasiswa.
     */
    public function getAvailableSemesters(int $limit = 12): array
    {
        $rows = DB::connection('sqlsrv')->select("
            SELECT TOP {$limit} id_smt, nm_smt
            FROM ref.semester
            WHERE expired_date IS NULL
              AND RIGHT(id_smt, 1) IN ('1','2')
            ORDER BY id_smt DESC
        ");
        return array_map(fn($r) => ['id_smt' => $r->id_smt, 'nm_smt' => $r->nm_smt], $rows);
    }

    /**
     * Get sebaran mahasiswa by jenis kelamin
     *
     * @return array
     */
    public function getSebaranByJenisKelamin(): array
    {
                $sql = "
            SELECT
                CASE
                    WHEN pd.jk = 'L' THEN 'Laki-laki'
                    WHEN pd.jk = 'P' THEN 'Perempuan'
                    ELSE 'Tidak Diketahui'
                END AS jenis_kelamin,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            GROUP BY pd.jk
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
        // ROW_NUMBER dedup → SUM = total summary 36,344.
        $sql = "
            SELECT
                COALESCE(dedup.nm_jalur_daftar, 'Tidak Diketahui') AS jalur_daftar,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    jd.nm_jalur_daftar,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                LEFT JOIN ref.jalur_daftar AS jd
                    ON jd.id_jalur_daftar = reg.id_jalur_daftar
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            WHERE dedup.rn = 1
            GROUP BY dedup.nm_jalur_daftar
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
        // ROW_NUMBER dedup → SUM = total summary 36,344.
        $sql = "
            SELECT
                COALESCE(dedup.nm_jns_daftar, 'Tidak Diketahui') AS jenis_pendaftaran,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    jp.nm_jns_daftar,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                LEFT JOIN ref.jenis_pendaftaran AS jp
                    ON jp.id_jns_daftar = reg.id_jns_daftar
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            WHERE dedup.rn = 1
            GROUP BY dedup.nm_jns_daftar
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
        // ROW_NUMBER dedup → SUM = total summary 36,344.
        $sql = "
            SELECT
                COALESCE(dedup.nm_pembiayaan, 'Tidak Diketahui') AS pembiayaan,
                COUNT(*) AS jumlah_mahasiswa
            FROM (
                SELECT
                    pd.id_pd,
                    pb.nm_pembiayaan,
                    ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                FROM pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                LEFT JOIN ref.pembiayaan AS pb
                    ON pb.id_pembiayaan = reg.id_pembiayaan
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
            ) AS dedup
            WHERE dedup.rn = 1
            GROUP BY dedup.nm_pembiayaan
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
                // Query untuk mendapatkan mahasiswa asing berdasarkan id_negara di ref.wilayah
        $sql = "
            SELECT
                COALESCE(negara.nm_negara, 'Tidak Diketahui') AS negara,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            LEFT JOIN ref.negara AS negara
                ON negara.id_negara = wil.id_negara
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND pd.id_stat_mhs = 'A'
                AND wil.id_negara IS NOT NULL
                AND wil.id_negara <> 'ID'
            GROUP BY negara.nm_negara
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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
                $sql = "
            SELECT
                CASE
                    WHEN wil.id_negara = 'ID' OR wil.id_negara IS NULL THEN 'Lokal'
                    ELSE 'Asing'
                END AS kategori,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND pd.id_stat_mhs = 'A'
            GROUP BY
                CASE
                    WHEN wil.id_negara = 'ID' OR wil.id_negara IS NULL THEN 'Lokal'
                    ELSE 'Asing'
                END
            ORDER BY jumlah_mahasiswa DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql);

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

        // Total mahasiswa aktif — pakai reg_pd sebagai source-of-truth.
        // Definisi: mahasiswa terdaftar di Unila dan belum punya SK keluar
        // (id_jns_keluar IS NULL). Realtime, tidak terpengaruh delay sync
        // kuliah_mhs per semester.
        $sqlTotal = "
            SELECT COUNT(DISTINCT pd.id_pd) AS total
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
        ";

        $totalResult = DB::connection('sqlsrv')->select($sqlTotal);
        $totalMahasiswa = (int) ($totalResult[0]->total ?? 0);

        // Total mahasiswa asing — sama base reg_pd
        $sqlAsing = "
            SELECT COUNT(DISTINCT pd.id_pd) AS total
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
            LEFT JOIN ref.wilayah AS wil
                ON wil.id_wil = pd.id_wil
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND pd.id_stat_mhs = 'A'
                AND wil.id_negara IS NOT NULL
                AND wil.id_negara <> 'ID'
        ";

        $asingResult = DB::connection('sqlsrv')->select($sqlAsing);
        $totalAsing = (int) ($asingResult[0]->total ?? 0);

        $tahun = substr($activePeriod, 0, 4);
        $tahunAjaran = $tahun . '/' . ($tahun + 1);

        return [
            'total_mahasiswa_aktif' => $totalMahasiswa,
            'total_mahasiswa_lokal' => $totalMahasiswa - $totalAsing,
            'total_mahasiswa_asing' => $totalAsing,
            'periode' => $activePeriod,
            'periode_nama' => $this->getSemesterName($activePeriod),
            'tahun_ajaran' => $tahunAjaran,
            'last_update' => $this->getLastUpdate($activePeriod),
            'last_feeder_sync' => $this->getLastFeederSync(),
            'formula' => "COUNT(DISTINCT pd.id_pd) WHERE reg_pd.id_jns_keluar IS NULL AND peserta_didik.id_stat_mhs = 'A' AND prodi.stat_prodi='A'",
            'sumber' => 'Sistem Informasi Akademik Unila (realtime)',
            'note' => "Total mahasiswa aktif terdaftar di Unila — INTERSECT dual confirm: belum punya SK keluar (reg_pd.id_jns_keluar IS NULL) DAN status master 'Aktif' (peserta_didik.id_stat_mhs = 'A'). Pendekatan paling konservatif untuk akurasi maksimal. Untuk angka per-semester (status A/M/C/N), lihat sebaran-status dengan filter periode.",
        ];
    }
}
