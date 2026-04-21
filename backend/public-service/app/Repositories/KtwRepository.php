<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * KtwRepository — query KTW (Kelulusan Tepat Waktu) dari PDUT SQL Server.
 *
 * Primary source of truth. Semua query langsung ke pdrd.reg_pd + pdrd.sms + pdrd.peserta_didik.
 * 4 definisi KTW didukung via parameter $definisi:
 *   - strict   : masa studi <= masa normatif (PDDIKTI standard, default)
 *   - tolerant : masa studi <= masa normatif + 0.25 tahun (tolerance s.d November)
 *   - survival : total lulus / maba (apakah akhirnya lulus)
 *   - aee      : Angka Efisiensi Edukasi (mhs aktif denominator)
 *
 * Referensi: docs/ktw/03-plan-solusi-ktw-myunila.md
 */
class KtwRepository
{
    /** Masa normatif per jenjang PDDIKTI (tahun). */
    public const MASA_NORMATIF = [
        'D3' => 3.0,
        'S1' => 4.0,
        'S2' => 2.0,
        'S3' => 3.0,
    ];

    /** Mapping id_jenj_didik pdut ke kode jenjang. */
    public const JENJANG_MAP = [
        22 => 'D3',
        23 => 'D4',
        30 => 'S1',
        35 => 'S2',
        40 => 'S3',
    ];

    /** Tolerance default (tahun) untuk definisi 'tolerant'. */
    public const TOLERANCE_YEARS = 0.25;

    /**
     * id_jns_daftar = 1 → "Peserta didik baru" (Maba murni).
     * Per arahan wali data 2026-04-21, KTW HANYA untuk Maba — exclude Pindahan (id=2),
     * Lintas Jalur (id=12), Alih Jenjang, RPL, dll.
     */
    public const JNS_DAFTAR_MABA = 1;

    protected function unilaIdSp(): string
    {
        return strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
    }

    /**
     * Build id_smt label untuk periode Gasal dari tahun angkatan (untuk display metadata).
     * Konvensi PDDIKTI: id_smt = "{tahun}{1=gasal, 2=genap, 3=pendek}".
     *
     * CATATAN: pdrd.reg_pd.id_smt di pdut Unila mostly kosong (6637/6794 empty untuk S1 ang 2021).
     * Jadi filter Gasal tidak pakai id_smt, tapi pakai MONTH(tgl_masuk_sp) >= 7 (Agustus-Desember).
     */
    protected function idSmtGasal(int $cohortYear): string
    {
        return sprintf('%d1', $cohortYear);
    }

    /**
     * Normalize cutoff_date: kalau null → hari ini. Kalau string → validate YYYY-MM-DD.
     * Return ISO date string untuk binding SQL Server.
     */
    protected function normalizeCutoff(?string $cutoffDate): string
    {
        if (!$cutoffDate) return date('Y-m-d');
        // Basic validation YYYY-MM-DD
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $cutoffDate)) return date('Y-m-d');
        return $cutoffDate;
    }

    /**
     * Overview university-wide untuk satu jenjang + tahun angkatan.
     * Filter mengikuti arahan wali data 2026-04-21:
     *   - Hanya Peserta Didik Baru (id_jns_daftar = 1) — exclude Pindahan/Lintas Jalur/Alih/RPL
     *   - Hanya periode masuk Gasal (id_smt = '{cohortYear}1')
     *   - Cutoff tgl_keluar optional (default hari ini)
     */
    public function getOverviewByCohort(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return $this->emptyOverview();

        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
        $tolerant = $normatif + self::TOLERANCE_YEARS;
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $idSmt = $this->idSmtGasal($cohortYear);

        try {
            $r = DB::connection('sqlsrv')->selectOne("
                SELECT
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND reg.tgl_keluar <= ?
                    THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant,
                    SUM(CASE WHEN reg.id_jns_keluar IS NULL THEN 1 ELSE 0 END) AS masih_aktif,
                    SUM(CASE WHEN reg.id_jns_keluar IN ('2','3','4','5','6','7') THEN 1 ELSE 0 END) AS keluar_non_lulus
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
            ", [$cutoff, $cutoff, $normatif, $cutoff, $tolerant, $this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj]);

            return $this->mapOverviewRow($r, $normatif, $tolerant, $cutoff, $idSmt);
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getOverviewByCohort: ' . $e->getMessage());
            return $this->emptyOverview();
        }
    }

    /**
     * KTW per-fakultas untuk angkatan + jenjang tertentu.
     * Filter: Peserta Didik Baru (id_jns_daftar=1) + Gasal (id_smt={year}1) + cutoff tgl_keluar.
     */
    public function getByFakultas(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];

        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
        $tolerant = $normatif + self::TOLERANCE_YEARS;
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $idSmt = $this->idSmtGasal($cohortYear);

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
                    COALESCE(fak.nm_lemb, 'Tidak diketahui') AS nm_fakultas,
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                    THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms fak ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
                GROUP BY CAST(sms.id_fak_unila AS VARCHAR(50)), fak.nm_lemb
                ORDER BY fak.nm_lemb
            ", [$cutoff, $cutoff, $normatif, $cutoff, $tolerant, $this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj]);

            return array_map(fn($r) => $this->mapFakultasRow((array) $r, $normatif, $tolerant), $rows);
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getByFakultas: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * KTW per-prodi. Bisa filter by fakultas (id_sms fakultas = uniqueidentifier).
     * Filter: Peserta Didik Baru + periode Gasal + cutoff.
     */
    public function getByProdi(int $cohortYear, string $jenjang = 'S1', ?string $idFakultas = null, ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];

        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
        $tolerant = $normatif + self::TOLERANCE_YEARS;
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $idSmt = $this->idSmtGasal($cohortYear);

        $bindings = [$cutoff, $cutoff, $normatif, $cutoff, $tolerant, $this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj];
        $fakFilter = '';
        if ($idFakultas) {
            $fakFilter = 'AND CAST(sms.id_fak_unila AS VARCHAR(50)) = ?';
            $bindings[] = $idFakultas;
        }

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    CAST(sms.id_sms AS VARCHAR(50)) AS id_prodi,
                    sms.kode_prodi AS kode_dikti,
                    sms.nm_lemb AS nm_prodi,
                    CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                    THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
                    {$fakFilter}
                GROUP BY sms.id_sms, sms.kode_prodi, sms.nm_lemb, sms.id_fak_unila
                ORDER BY sms.nm_lemb
            ", $bindings);

            return array_map(fn($r) => $this->mapProdiRow((array) $r, $normatif, $tolerant), $rows);
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getByProdi: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Detail prodi + histogram masa studi.
     */
    public function getProdiDetail(string $idSms, int $cohortYear): ?array
    {
        try {
            $prodi = DB::connection('sqlsrv')->selectOne("
                SELECT
                    CAST(sms.id_sms AS VARCHAR(50)) AS id_prodi,
                    sms.kode_prodi AS kode_dikti,
                    sms.nm_lemb AS nm_prodi,
                    sms.id_jenj_didik,
                    jenjang.nm_jenj_didik AS nm_jenjang,
                    CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
                    fak.nm_lemb AS nm_fakultas
                FROM pdrd.sms sms
                JOIN ref.jenjang_pendidikan jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN pdrd.sms fak ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0
                WHERE CAST(sms.id_sms AS VARCHAR(50)) = ?
                  AND sms.soft_delete = 0
            ", [$idSms]);

            if (!$prodi) return null;

            $jenjang = self::JENJANG_MAP[(int)$prodi->id_jenj_didik] ?? 'S1';
            $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
            $tolerant = $normatif + self::TOLERANCE_YEARS;

            $overview = DB::connection('sqlsrv')->selectOne("
                SELECT
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar = '1' THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant,
                    SUM(CASE WHEN reg.id_jns_keluar IS NULL THEN 1 ELSE 0 END) AS masih_aktif
                FROM pdrd.reg_pd reg
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sms AS VARCHAR(50)) = ?
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND YEAR(reg.tgl_masuk_sp) = ?
            ", [$normatif, $tolerant, $idSms, $this->unilaIdSp(), $cohortYear]);

            return [
                'prodi' => (array) $prodi,
                'jenjang_kode' => $jenjang,
                'masa_normatif_tahun' => $normatif,
                'tolerance_tahun' => self::TOLERANCE_YEARS,
                'overview' => $this->mapOverviewRow($overview, $normatif, $tolerant),
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getProdiDetail: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Trend KTW cohort range 5 tahun per jenjang (univ-wide).
     */
    public function getTrendAllCohorts(string $jenjang, int $startYear, int $endYear): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];

        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
        $tolerant = $normatif + self::TOLERANCE_YEARS;

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    YEAR(reg.tgl_masuk_sp) AS tahun,
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar = '1' THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND YEAR(reg.tgl_masuk_sp) BETWEEN ? AND ?
                    AND sms.id_jenj_didik = ?
                GROUP BY YEAR(reg.tgl_masuk_sp)
                ORDER BY YEAR(reg.tgl_masuk_sp)
            ", [$normatif, $tolerant, $this->unilaIdSp(), $startYear, $endYear, $idJenj]);

            return array_map(fn($r) => $this->mapOverviewRow($r, $normatif, $tolerant), $rows);
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getTrendAllCohorts: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * List individual mahasiswa di satu prodi angkatan, paginated.
     * Dipakai oleh dashboard pimpinan + raw data service. TIDAK diekspos ke public infografis.
     */
    public function getMahasiswaListByProdi(string $idSms, int $cohortYear, int $page = 1, int $limit = 50): array
    {
        $offset = max(0, ($page - 1) * $limit);

        try {
            $prodi = DB::connection('sqlsrv')->selectOne("
                SELECT sms.id_jenj_didik, sms.nm_lemb AS nm_prodi, jenjang.nm_jenj_didik
                FROM pdrd.sms sms
                JOIN ref.jenjang_pendidikan jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                WHERE CAST(sms.id_sms AS VARCHAR(50)) = ?
            ", [$idSms]);

            if (!$prodi) return ['data' => [], 'total' => 0];

            $jenjang = self::JENJANG_MAP[(int)$prodi->id_jenj_didik] ?? 'S1';
            $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;
            $tolerant = $normatif + self::TOLERANCE_YEARS;

            $total = DB::connection('sqlsrv')->selectOne("
                SELECT COUNT(*) AS total
                FROM pdrd.reg_pd reg
                WHERE reg.soft_delete = 0
                  AND CAST(reg.id_sms AS VARCHAR(50)) = ?
                  AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                  AND YEAR(reg.tgl_masuk_sp) = ?
            ", [$idSms, $this->unilaIdSp(), $cohortYear])->total ?? 0;

            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    reg.nipd AS nim,
                    pd.nm_pd AS nama,
                    reg.angkatan,
                    reg.tgl_masuk_sp,
                    reg.tgl_keluar,
                    reg.ipk,
                    reg.id_jns_keluar,
                    CASE reg.id_jns_keluar
                        WHEN '1' THEN 'Lulus'
                        WHEN '2' THEN 'Mutasi'
                        WHEN '3' THEN 'Dikeluarkan'
                        WHEN '4' THEN 'Mengundurkan Diri'
                        WHEN '5' THEN 'Putus Studi'
                        WHEN '6' THEN 'Wafat'
                        WHEN '7' THEN 'Hilang'
                        ELSE 'Aktif'
                    END AS status_keluar,
                    CASE WHEN reg.tgl_keluar IS NULL THEN NULL
                         ELSE ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2)
                    END AS masa_mukim_tahun,
                    CASE
                        WHEN reg.id_jns_keluar = '1'
                         AND reg.tgl_keluar IS NOT NULL
                         AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                        THEN 1 ELSE 0
                    END AS is_ktw_strict,
                    CASE
                        WHEN reg.id_jns_keluar = '1'
                         AND reg.tgl_keluar IS NOT NULL
                         AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                        THEN 1 ELSE 0
                    END AS is_ktw_tolerant
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = reg.id_pd
                WHERE reg.soft_delete = 0
                  AND CAST(reg.id_sms AS VARCHAR(50)) = ?
                  AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                  AND YEAR(reg.tgl_masuk_sp) = ?
                ORDER BY reg.nipd
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            ", [$normatif, $tolerant, $idSms, $this->unilaIdSp(), $cohortYear, $offset, $limit]);

            return [
                'data' => array_map(function($r) {
                    $a = (array) $r;
                    $a['is_ktw_strict'] = (bool) $a['is_ktw_strict'];
                    $a['is_ktw_tolerant'] = (bool) $a['is_ktw_tolerant'];
                    return $a;
                }, $rows),
                'total' => (int) $total,
                'jenjang_kode' => $jenjang,
                'masa_normatif_tahun' => $normatif,
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getMahasiswaListByProdi: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Dynamic cutoff presets dari ref.semester pdut.
     * Return list tanggal cut-off relevan (akhir semester akademik, awal semester baru, wisuda tipikal).
     */
    public function getSemesterPresets(?int $currentYear = null): array
    {
        $year = $currentYear ?? (int) date('Y');
        $yearPast = $year - 1;
        $yearFuture = $year + 1;

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT id_smt, nm_smt, tgl_mulai, tgl_selesai, a_periode_aktif
                FROM ref.semester
                WHERE id_smt BETWEEN ? AND ?
                  AND tgl_selesai IS NOT NULL
                  AND expired_date IS NULL
                ORDER BY id_smt DESC
            ", [sprintf('%d1', $yearPast - 1), sprintf('%d3', $yearFuture)]);

            $presets = [];
            // Akhir semester — paling umum untuk cutoff laporan
            foreach ($rows as $r) {
                $endDate = $r->tgl_selesai ? substr($r->tgl_selesai, 0, 10) : null;
                if (!$endDate) continue;
                $presets[] = [
                    'group' => 'Akhir Semester',
                    'label' => "Akhir {$r->nm_smt} ({$endDate})",
                    'value' => $endDate,
                    'id_smt' => $r->id_smt,
                    'aktif' => (int) ($r->a_periode_aktif ?? 0) === 1,
                ];
            }

            // Common static presets (tetap relevan)
            $today = date('Y-m-d');
            $endOfLastMonth = date('Y-m-d', strtotime('last day of previous month'));
            $endOfThisMonth = date('Y-m-d', strtotime('last day of this month'));
            $presets[] = ['group' => 'Umum', 'label' => "Hari ini ({$today})", 'value' => $today, 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Umum', 'label' => "Akhir bulan ini ({$endOfThisMonth})", 'value' => $endOfThisMonth, 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Umum', 'label' => "Akhir bulan lalu ({$endOfLastMonth})", 'value' => $endOfLastMonth, 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Akhir Tahun', 'label' => "31 Desember {$year}", 'value' => "{$year}-12-31", 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Akhir Tahun', 'label' => "31 Desember {$yearPast}", 'value' => "{$yearPast}-12-31", 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Wisuda', 'label' => "Wisuda Maret {$year} (30 Mar)", 'value' => "{$year}-03-30", 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Wisuda', 'label' => "Wisuda Agustus {$year} (30 Agu)", 'value' => "{$year}-08-30", 'id_smt' => null, 'aktif' => false];
            $presets[] = ['group' => 'Wisuda', 'label' => "Wisuda November {$year} (30 Nov)", 'value' => "{$year}-11-30", 'id_smt' => null, 'aktif' => false];

            return $presets;
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getSemesterPresets: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Top N prodi dengan KTW tertinggi untuk angkatan + jenjang + cutoff.
     */
    public function getTopProdi(int $cohortYear, string $jenjang = 'S1', int $limit = 10, ?string $cutoffDate = null): array
    {
        $all = $this->getByProdi($cohortYear, $jenjang, null, $cutoffDate);
        $filtered = array_filter($all, fn($p) => $p['maba'] >= 20); // minimum 20 maba biar statistically meaningful
        usort($filtered, fn($a, $b) => $b['pct_ktw_strict'] <=> $a['pct_ktw_strict']);
        return array_slice($filtered, 0, $limit);
    }

    /**
     * Breakdown status mahasiswa per angkatan: berapa Lulus / Aktif / DO / PS / dll.
     * Inspired dari spordit.detail_status_mhs_tahunan tapi compute dari pdut realtime.
     *
     * Mapping id_jns_keluar:
     *   NULL → Aktif
     *   '1'  → Lulus
     *   '2'  → Mutasi
     *   '3'  → Dikeluarkan
     *   '4'  → Mengundurkan diri
     *   '5'  → Putus Studi
     *   '6'  → Meninggal dunia
     *   '7'  → Hilang
     */
    public function getStatusBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];
        $cutoff = $this->normalizeCutoff($cutoffDate);

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    ISNULL(reg.id_jns_keluar, '0') AS id_jns_keluar,
                    COUNT(*) AS jumlah
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
                    AND (reg.tgl_keluar IS NULL OR reg.tgl_keluar <= ?)
                GROUP BY reg.id_jns_keluar
                ORDER BY jumlah DESC
            ", [$this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj, $cutoff]);

            $labelMap = [
                '0' => ['Aktif', '#3b82f6'],
                '1' => ['Lulus', '#10b981'],
                '2' => ['Mutasi', '#a855f7'],
                '3' => ['Dikeluarkan', '#ef4444'],
                '4' => ['Mengundurkan Diri', '#f59e0b'],
                '5' => ['Putus Studi', '#dc2626'],
                '6' => ['Meninggal Dunia', '#6b7280'],
                '7' => ['Hilang', '#475569'],
            ];

            $total = 0;
            foreach ($rows as $r) $total += (int) $r->jumlah;

            $result = [];
            foreach ($rows as $r) {
                $code = (string) $r->id_jns_keluar;
                $info = $labelMap[$code] ?? [sprintf('Kode %s', $code), '#94a3b8'];
                $jumlah = (int) $r->jumlah;
                $result[] = [
                    'id_jns_keluar' => $code,
                    'nm_status' => $info[0],
                    'color' => $info[1],
                    'jumlah' => $jumlah,
                    'persentase' => $total > 0 ? round($jumlah / $total * 100, 2) : 0.0,
                ];
            }
            return $result;
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getStatusBreakdown: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Breakdown per jalur daftar (SBMPTN/SNMPTN/Mandiri/dll).
     * Source: pdrd.reg_pd.id_jalur_daftar + ref.jalur_daftar.nm_jalur_daftar.
     */
    public function getJalurBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    reg.id_jalur_daftar,
                    COALESCE(jd.nm_jalur_daftar, 'Tidak diketahui') AS nm_jalur,
                    COUNT(*) AS maba,
                    SUM(CASE WHEN reg.id_jns_keluar='1' AND reg.tgl_keluar <= ? THEN 1 ELSE 0 END) AS lulus,
                    SUM(CASE WHEN reg.id_jns_keluar='1' AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                LEFT JOIN ref.jalur_daftar jd ON jd.id_jalur_daftar = reg.id_jalur_daftar
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
                GROUP BY reg.id_jalur_daftar, jd.nm_jalur_daftar
                ORDER BY maba DESC
            ", [$cutoff, $cutoff, $normatif, $this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj]);

            return array_map(function ($r) {
                $maba = (int) $r->maba;
                return [
                    'id_jalur_daftar' => $r->id_jalur_daftar,
                    'nm_jalur' => $r->nm_jalur,
                    'maba' => $maba,
                    'lulus' => (int) $r->lulus,
                    'ktw' => (int) $r->ktw,
                    'pct_ktw' => $maba > 0 ? round($r->ktw / $maba * 100, 2) : 0.0,
                    'pct_survival' => $maba > 0 ? round($r->lulus / $maba * 100, 2) : 0.0,
                ];
            }, $rows);
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getJalurBreakdown: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Statistik masa mukim lulusan — avg/min/max/median/stddev.
     * Hanya untuk mahasiswa yang sudah lulus (id_jns_keluar=1).
     */
    public function getMasaMukimStats(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;

        try {
            $r = DB::connection('sqlsrv')->selectOne("
                SELECT
                    COUNT(*) AS jumlah_lulusan,
                    AVG(masa) AS avg_masa,
                    MIN(masa) AS min_masa,
                    MAX(masa) AS max_masa,
                    STDEV(masa) AS stddev_masa
                FROM (
                    SELECT ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) AS masa
                    FROM pdrd.reg_pd reg
                    INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                    WHERE reg.soft_delete = 0
                        AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                        AND reg.id_jns_daftar = ?
                        AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                        AND sms.id_jenj_didik = ?
                        AND reg.id_jns_keluar = '1'
                        AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= ?
                ) t
            ", [$this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj, $cutoff]);

            return [
                'jumlah_lulusan' => (int) ($r->jumlah_lulusan ?? 0),
                'avg_masa' => round((float) ($r->avg_masa ?? 0), 2),
                'min_masa' => round((float) ($r->min_masa ?? 0), 2),
                'max_masa' => round((float) ($r->max_masa ?? 0), 2),
                'stddev_masa' => round((float) ($r->stddev_masa ?? 0), 2),
                'masa_normatif_tahun' => $normatif,
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getMasaMukimStats: ' . $e->getMessage());
            return ['jumlah_lulusan' => 0, 'avg_masa' => 0, 'min_masa' => 0, 'max_masa' => 0, 'stddev_masa' => 0, 'masa_normatif_tahun' => $normatif];
        }
    }

    /**
     * Gender breakdown mahasiswa per angkatan: Laki-laki vs Perempuan.
     * pdut: peserta_didik.jk = 'L' atau 'P'.
     */
    public function getGenderBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $idJenj = array_search($jenjang, self::JENJANG_MAP, true);
        if ($idJenj === false) return [];
        $cutoff = $this->normalizeCutoff($cutoffDate);
        $normatif = self::MASA_NORMATIF[$jenjang] ?? 4.0;

        try {
            $r = DB::connection('sqlsrv')->selectOne("
                SELECT
                    SUM(CASE WHEN pd.jk = 'L' THEN 1 ELSE 0 END) AS maba_l,
                    SUM(CASE WHEN pd.jk = 'P' THEN 1 ELSE 0 END) AS maba_p,
                    SUM(CASE WHEN pd.jk = 'L' AND reg.id_jns_keluar='1' AND reg.tgl_keluar <= ? THEN 1 ELSE 0 END) AS lulus_l,
                    SUM(CASE WHEN pd.jk = 'P' AND reg.id_jns_keluar='1' AND reg.tgl_keluar <= ? THEN 1 ELSE 0 END) AS lulus_p,
                    SUM(CASE WHEN pd.jk = 'L' AND reg.id_jns_keluar='1' AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_l,
                    SUM(CASE WHEN pd.jk = 'P' AND reg.id_jns_keluar='1' AND reg.tgl_keluar <= ?
                        AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= ?
                    THEN 1 ELSE 0 END) AS ktw_p
                FROM pdrd.reg_pd reg
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = reg.id_pd
                INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND reg.id_jns_daftar = ?
                    AND YEAR(reg.tgl_masuk_sp) = ? AND MONTH(reg.tgl_masuk_sp) >= 7
                    AND sms.id_jenj_didik = ?
            ", [$cutoff, $cutoff, $cutoff, $normatif, $cutoff, $normatif, $this->unilaIdSp(), self::JNS_DAFTAR_MABA, $cohortYear, $idJenj]);

            $mabaL = (int) ($r->maba_l ?? 0);
            $mabaP = (int) ($r->maba_p ?? 0);
            return [
                [
                    'jk' => 'L',
                    'nm_gender' => 'Laki-laki',
                    'color' => '#3b82f6',
                    'maba' => $mabaL,
                    'lulus' => (int) ($r->lulus_l ?? 0),
                    'ktw_strict' => (int) ($r->ktw_l ?? 0),
                    'pct_ktw' => $mabaL > 0 ? round(($r->ktw_l ?? 0) / $mabaL * 100, 2) : 0.0,
                ],
                [
                    'jk' => 'P',
                    'nm_gender' => 'Perempuan',
                    'color' => '#ec4899',
                    'maba' => $mabaP,
                    'lulus' => (int) ($r->lulus_p ?? 0),
                    'ktw_strict' => (int) ($r->ktw_p ?? 0),
                    'pct_ktw' => $mabaP > 0 ? round(($r->ktw_p ?? 0) / $mabaP * 100, 2) : 0.0,
                ],
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwRepository.getGenderBreakdown: ' . $e->getMessage());
            return [];
        }
    }

    // =================================
    // Helpers
    // =================================

    protected function emptyOverview(): array
    {
        return [
            'maba' => 0, 'sudah_lulus' => 0,
            'ktw_strict' => 0, 'ktw_tolerant' => 0,
            'masih_aktif' => 0, 'keluar_non_lulus' => 0,
            'pct_ktw_strict' => 0.0, 'pct_ktw_tolerant' => 0.0,
            'pct_survival' => 0.0,
        ];
    }

    protected function mapOverviewRow($r, float $normatif, float $tolerant, ?string $cutoff = null, ?string $idSmt = null): array
    {
        if (!$r) return $this->emptyOverview();
        $arr = (array) $r;
        $maba = (int) ($arr['maba'] ?? 0);
        $lulus = (int) ($arr['sudah_lulus'] ?? 0);
        $strict = (int) ($arr['ktw_strict'] ?? 0);
        $tol = (int) ($arr['ktw_tolerant'] ?? 0);

        return [
            'tahun' => $arr['tahun'] ?? null,
            'maba' => $maba,
            'sudah_lulus' => $lulus,
            'ktw_strict' => $strict,
            'ktw_tolerant' => $tol,
            'masih_aktif' => (int) ($arr['masih_aktif'] ?? 0),
            'keluar_non_lulus' => (int) ($arr['keluar_non_lulus'] ?? 0),
            'pct_ktw_strict' => $maba > 0 ? round($strict / $maba * 100, 2) : 0.0,
            'pct_ktw_tolerant' => $maba > 0 ? round($tol / $maba * 100, 2) : 0.0,
            'pct_survival' => $maba > 0 ? round($lulus / $maba * 100, 2) : 0.0,
            'masa_normatif_tahun' => $normatif,
            'tolerance_tahun' => self::TOLERANCE_YEARS,
            'cutoff_date' => $cutoff,
            'id_smt_masuk' => $idSmt,
        ];
    }

    protected function mapFakultasRow(array $r, float $normatif, float $tolerant): array
    {
        $maba = (int) ($r['maba'] ?? 0);
        return [
            'id_fakultas' => $r['id_fakultas'] ?? null,
            'nm_fakultas' => $r['nm_fakultas'] ?? 'Tidak diketahui',
            'maba' => $maba,
            'sudah_lulus' => (int) ($r['sudah_lulus'] ?? 0),
            'ktw_strict' => (int) ($r['ktw_strict'] ?? 0),
            'ktw_tolerant' => (int) ($r['ktw_tolerant'] ?? 0),
            'pct_ktw_strict' => $maba > 0 ? round(($r['ktw_strict'] ?? 0) / $maba * 100, 2) : 0.0,
            'pct_ktw_tolerant' => $maba > 0 ? round(($r['ktw_tolerant'] ?? 0) / $maba * 100, 2) : 0.0,
            'pct_survival' => $maba > 0 ? round(($r['sudah_lulus'] ?? 0) / $maba * 100, 2) : 0.0,
        ];
    }

    protected function mapProdiRow(array $r, float $normatif, float $tolerant): array
    {
        $maba = (int) ($r['maba'] ?? 0);
        $pctKtw = $maba > 0 ? round(($r['ktw_strict'] ?? 0) / $maba * 100, 2) : 0.0;
        // Flag "bawah standar" = KTW < 50% (threshold BAN-PT umum). Baru bisa di-flag kalau
        // angkatan sudah masuk tahun ke-normatif (sudah punya banyak kandidat lulus).
        $flagBawahStandar = $pctKtw > 0 && $pctKtw < 50.0 && $maba >= 5;
        return [
            'id_prodi' => $r['id_prodi'] ?? null,
            'kode_dikti' => $r['kode_dikti'] ?? null,
            'nm_prodi' => $r['nm_prodi'] ?? 'Tidak diketahui',
            'id_fakultas' => $r['id_fakultas'] ?? null,
            'maba' => $maba,
            'sudah_lulus' => (int) ($r['sudah_lulus'] ?? 0),
            'ktw_strict' => (int) ($r['ktw_strict'] ?? 0),
            'ktw_tolerant' => (int) ($r['ktw_tolerant'] ?? 0),
            'pct_ktw_strict' => $pctKtw,
            'pct_ktw_tolerant' => $maba > 0 ? round(($r['ktw_tolerant'] ?? 0) / $maba * 100, 2) : 0.0,
            'pct_survival' => $maba > 0 ? round(($r['sudah_lulus'] ?? 0) / $maba * 100, 2) : 0.0,
            'flag_bawah_standar' => $flagBawahStandar,
        ];
    }
}
