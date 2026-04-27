<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class IkuRepository extends BaseRepository
{
    /**
     * Konfigurasi jenjang pendidikan untuk IKU 1 (AEE)
     * id_jenj_didik codes dari ref.jenjang_pendidikan
     */
    private const JENJANG_CONFIG = [
        'D3' => ['id_jenj_didik' => 22, 'masa_studi_tahun' => 3, 'aee_ideal' => 33.0],
        'S1' => ['id_jenj_didik' => 30, 'masa_studi_tahun' => 4, 'aee_ideal' => 25.0],
        'S2' => ['id_jenj_didik' => 35, 'masa_studi_tahun' => 2, 'aee_ideal' => 50.0],
        'S3' => ['id_jenj_didik' => 40, 'masa_studi_tahun' => 3, 'aee_ideal' => 33.0],
    ];

    /**
     * IKU 2: Jenjang yang dihitung (S1 & Diploma saja)
     */
    private const IKU2_JENJANG = [22, 23, 30]; // D3, D4, S1

    /**
     * Fallback UMP jika data umr_wilayah belum tersedia untuk wilayah/tahun tertentu
     */
    private const UMP_FALLBACK = 3006833;
    private const UMP_MULTIPLIER = 1.2; // threshold = 1.2x UMP

    // =========================================
    // HELPERS
    // =========================================

    public function getJenjangConfig(): array
    {
        return self::JENJANG_CONFIG;
    }

    /**
     * Public wrapper for BaseRepository::getMaxYear
     */
    public function getYearFromSemesters(array $semesterIds): int
    {
        return (int) $this->getMaxYear($semesterIds);
    }

    /**
     * Get active semester from ref.semester
     */
    public function getActiveSemester(): string
    {
        // Ambil semester aktif terbaru. Kalau ada >1 row a_periode_aktif=1
        // (mis. transisi Ganjil→Genap belum di-flip), pilih id_smt paling
        // akhir supaya konsisten dengan period semester yang sedang berjalan.
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
            ORDER BY id_smt DESC
        ";

        $result = $this->selectOne($sql);

        if (!$result) {
            $sql = "
                SELECT TOP 1 id_smt
                FROM ref.semester
                WHERE expired_date IS NULL
                    AND RIGHT(id_smt, 1) < '3'
                ORDER BY id_smt DESC
            ";
            $result = $this->selectOne($sql);
        }

        return $result->id_smt ?? date('Y') . '1';
    }

    // =========================================
    // IKU 1: ANGKA EFISIENSI EDUKASI (AEE)
    // =========================================

    /**
     * Count mahasiswa aktif per jenjang pada semester tertentu
     * Mendukung multiple semester via IN clause
     */
    public function countMahasiswaAktif(array $semesters, int $idJenjang, ?string $fakultas = null): int
    {
        $bindings = [];
        $smtIn = $this->buildInClause($semesters, $bindings);
        $bindings[] = $idJenjang;
        $bindings[] = self::UNILA_ID_SP;
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT kmh.id_reg_pd)
            FROM pdrd.kuliah_mhs AS kmh
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs IN ('A', 'M')
                AND kmh.id_smt IN {$smtIn}
                AND sms.id_jenj_didik = ?
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count lulusan tepat waktu pada tahun tertentu
     * Mendukung multiple tahun via IN clause
     */
    public function countLulusTepatWaktu(array $years, int $idJenjang, int $masaStudiTahun, ?string $fakultas = null): int
    {
        $bindings = [$idJenjang, self::UNILA_ID_SP];
        $yearIn = $this->buildInClause($years, $bindings);
        $bindings[] = $masaStudiTahun;
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT reg.id_reg_pd)
            FROM pdrd.reg_pd AS reg
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE reg.soft_delete = 0
                AND sms.id_jenj_didik = ?
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_masuk_sp IS NOT NULL
                AND reg.tgl_keluar IS NOT NULL
                AND reg.no_seri_ijazah IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) IN {$yearIn}
                AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Hitung AEE untuk satu jenjang
     */
    public function calculateAEEPerJenjang(array $semesters, array $years, string $jenjangKey, ?string $fakultas = null): array
    {
        $config = self::JENJANG_CONFIG[$jenjangKey];

        $totalAktif = $this->countMahasiswaAktif($semesters, $config['id_jenj_didik'], $fakultas);
        $lulusTepatWaktu = $this->countLulusTepatWaktu($years, $config['id_jenj_didik'], $config['masa_studi_tahun'], $fakultas);

        $aeeRealisasi = $totalAktif > 0
            ? round(($lulusTepatWaktu / $totalAktif) * 100, 2)
            : 0;

        $tingkatPencapaian = $config['aee_ideal'] > 0
            ? round(($aeeRealisasi / $config['aee_ideal']) * 100, 2)
            : 0;

        return [
            'jenjang' => $jenjangKey,
            'lulus_tepat_waktu' => $lulusTepatWaktu,
            'total_aktif' => $totalAktif,
            'aee_realisasi' => $aeeRealisasi,
            'aee_ideal' => $config['aee_ideal'],
            'tingkat_pencapaian' => $tingkatPencapaian,
        ];
    }

    /**
     * Hitung AEE PT (rata-rata tingkat pencapaian semua jenjang)
     */
    public function calculateAEEPT(array $semesters, array $years, ?string $fakultas = null): array
    {
        $perJenjang = [];
        $totalPencapaian = 0;
        $countJenjang = 0;

        foreach (self::JENJANG_CONFIG as $key => $config) {
            $result = $this->calculateAEEPerJenjang($semesters, $years, $key, $fakultas);
            $perJenjang[] = $result;

            if ($result['total_aktif'] > 0) {
                $totalPencapaian += $result['tingkat_pencapaian'];
                $countJenjang++;
            }
        }

        $aeePT = $countJenjang > 0
            ? round($totalPencapaian / $countJenjang, 2)
            : 0;

        return [
            'aee_pt' => $aeePT,
            'per_jenjang' => $perJenjang,
        ];
    }

    /**
     * Drilldown: AEE per fakultas
     * Mendukung multiple semester dan tahun
     */
    public function getAEEPerFakultas(array $semesters, array $years): array
    {
        $fakultasData = [];

        foreach (self::JENJANG_CONFIG as $key => $config) {
            $bindings = [];
            $yearIn = $this->buildInClause($years, $bindings);
            $bindings[] = $config['masa_studi_tahun'];
            $bindings[] = self::UNILA_ID_SP;
            $smtIn = $this->buildInClause($semesters, $bindings);
            $bindings[] = $config['id_jenj_didik'];

            $sql = "
                SELECT
                    CONVERT(VARCHAR(36), fak.id_sms) AS id_fakultas,
                    fak.nm_lemb AS nama_fakultas,
                    COUNT(DISTINCT CASE
                        WHEN reg.id_jns_keluar = '1'
                             AND reg.no_seri_ijazah IS NOT NULL
                             AND reg.tgl_masuk_sp IS NOT NULL
                             AND reg.tgl_keluar IS NOT NULL
                             AND YEAR(reg.tgl_keluar) IN {$yearIn}
                             AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                        THEN reg.id_reg_pd
                    END) AS lulus_tepat_waktu,
                    COUNT(DISTINCT kmh_sub.id_reg_pd) AS total_aktif
                FROM pdrd.sms AS sms
                INNER JOIN pdrd.sms AS fak
                    ON fak.id_sms = sms.id_fak_unila
                    AND fak.soft_delete = 0
                INNER JOIN ref.jenjang_pendidikan AS jenjang
                    ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.reg_pd AS reg
                    ON reg.id_sms = sms.id_sms
                    AND reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                LEFT JOIN (
                    SELECT kmh.id_reg_pd, rp.id_sms
                    FROM pdrd.kuliah_mhs AS kmh
                    INNER JOIN pdrd.reg_pd AS rp
                        ON rp.id_reg_pd = kmh.id_reg_pd
                        AND rp.soft_delete = 0
                    WHERE kmh.soft_delete = 0
                        AND kmh.id_stat_mhs IN ('A', 'M')
                        AND kmh.id_smt IN {$smtIn}
                ) AS kmh_sub ON kmh_sub.id_sms = sms.id_sms
                WHERE sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                    AND sms.id_jenj_didik = ?
                GROUP BY fak.id_sms, fak.nm_lemb
                HAVING COUNT(DISTINCT kmh_sub.id_reg_pd) > 0
            ";

            $results = $this->select($sql, $bindings);

            foreach ($results as $row) {
                $idFak = $row->id_fakultas;
                if (!isset($fakultasData[$idFak])) {
                    $fakultasData[$idFak] = [
                        'id' => $idFak,
                        'name' => $row->nama_fakultas,
                        'jenjang_data' => [],
                    ];
                }

                $totalAktif = (int) $row->total_aktif;
                $lulusTW = (int) $row->lulus_tepat_waktu;
                $aeeRealisasi = $totalAktif > 0 ? ($lulusTW / $totalAktif) * 100 : 0;
                $tingkatPencapaian = $config['aee_ideal'] > 0 ? ($aeeRealisasi / $config['aee_ideal']) * 100 : 0;

                $fakultasData[$idFak]['jenjang_data'][] = [
                    'tingkat_pencapaian' => $tingkatPencapaian,
                    'total_aktif' => $totalAktif,
                ];
            }
        }

        $result = [];
        foreach ($fakultasData as $fak) {
            $validJenjang = array_filter($fak['jenjang_data'], fn($j) => $j['total_aktif'] > 0);
            $count = count($validJenjang);
            $aeePT = $count > 0
                ? round(array_sum(array_column($validJenjang, 'tingkat_pencapaian')) / $count, 2)
                : 0;

            $result[] = [
                'id' => $fak['id'],
                'name' => $fak['name'],
                'value' => $aeePT,
            ];
        }

        usort($result, fn($a, $b) => $b['value'] <=> $a['value']);

        return $result;
    }

    /**
     * Drilldown children: AEE per prodi dalam satu fakultas
     */
    public function getAEEPerProdi(array $semesters, array $years, string $idFakultas): array
    {
        $prodiData = [];

        foreach (self::JENJANG_CONFIG as $key => $config) {
            $bindings = [];
            $yearIn = $this->buildInClause($years, $bindings);
            $bindings[] = $config['masa_studi_tahun'];
            $bindings[] = self::UNILA_ID_SP;
            $smtIn = $this->buildInClause($semesters, $bindings);
            $bindings[] = $config['id_jenj_didik'];
            $bindings[] = $idFakultas;

            $sql = "
                SELECT
                    CONVERT(VARCHAR(36), sms.id_sms) AS id_prodi,
                    sms.nm_lemb AS nama_prodi,
                    COUNT(DISTINCT CASE
                        WHEN reg.id_jns_keluar = '1'
                             AND reg.no_seri_ijazah IS NOT NULL
                             AND reg.tgl_masuk_sp IS NOT NULL
                             AND reg.tgl_keluar IS NOT NULL
                             AND YEAR(reg.tgl_keluar) IN {$yearIn}
                             AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= ?
                        THEN reg.id_reg_pd
                    END) AS lulus_tepat_waktu,
                    COUNT(DISTINCT kmh_sub.id_reg_pd) AS total_aktif
                FROM pdrd.sms AS sms
                INNER JOIN ref.jenjang_pendidikan AS jenjang
                    ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.reg_pd AS reg
                    ON reg.id_sms = sms.id_sms
                    AND reg.soft_delete = 0
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                LEFT JOIN (
                    SELECT kmh.id_reg_pd, rp.id_sms
                    FROM pdrd.kuliah_mhs AS kmh
                    INNER JOIN pdrd.reg_pd AS rp
                        ON rp.id_reg_pd = kmh.id_reg_pd
                        AND rp.soft_delete = 0
                    WHERE kmh.soft_delete = 0
                        AND kmh.id_stat_mhs IN ('A', 'M')
                        AND kmh.id_smt IN {$smtIn}
                ) AS kmh_sub ON kmh_sub.id_sms = sms.id_sms
                WHERE sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                    AND sms.id_jenj_didik = ?
                    AND sms.id_fak_unila = ?
                GROUP BY sms.id_sms, sms.nm_lemb
                HAVING COUNT(DISTINCT kmh_sub.id_reg_pd) > 0
            ";

            $results = $this->select($sql, $bindings);

            foreach ($results as $row) {
                $idProdi = $row->id_prodi;
                if (!isset($prodiData[$idProdi])) {
                    $prodiData[$idProdi] = [
                        'id' => $idProdi,
                        'name' => $row->nama_prodi,
                        'jenjang_data' => [],
                    ];
                }

                $totalAktif = (int) $row->total_aktif;
                $lulusTW = (int) $row->lulus_tepat_waktu;
                $aeeRealisasi = $totalAktif > 0 ? ($lulusTW / $totalAktif) * 100 : 0;
                $tingkatPencapaian = $config['aee_ideal'] > 0 ? ($aeeRealisasi / $config['aee_ideal']) * 100 : 0;

                $prodiData[$idProdi]['jenjang_data'][] = [
                    'tingkat_pencapaian' => $tingkatPencapaian,
                    'total_aktif' => $totalAktif,
                ];
            }
        }

        $result = [];
        foreach ($prodiData as $prodi) {
            $validJenjang = array_filter($prodi['jenjang_data'], fn($j) => $j['total_aktif'] > 0);
            $count = count($validJenjang);
            $aeePT = $count > 0
                ? round(array_sum(array_column($validJenjang, 'tingkat_pencapaian')) / $count, 2)
                : 0;

            $result[] = [
                'id' => $prodi['id'],
                'name' => $prodi['name'],
                'value' => $aeePT,
            ];
        }

        usort($result, fn($a, $b) => $b['value'] <=> $a['value']);

        return $result;
    }

    /**
     * Trend AEE PT 5 tahun terakhir
     */
    public function getTrendAEE(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $aeeData = $this->calculateAEEPT([$yr . '1'], [$yr]);

            $trend[] = [
                'name' => (string) $yr,
                'value' => $aeeData['aee_pt'],
            ];
        }

        return $trend;
    }

    // =========================================
    // IKU 2: LULUSAN BEKERJA/STUDI LANJUT/WIRASWASTA
    // =========================================

    /**
     * Denominator: Total lulusan S1 & diploma pada tahun tertentu
     */
    public function countTotalLulusanIKU2(array $years, ?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $yearIn = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT reg.id_reg_pd)
            FROM pdrd.reg_pd AS reg
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_keluar IS NOT NULL
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND YEAR(reg.tgl_keluar) IN {$yearIn}
                AND sms.id_jenj_didik IN (22, 23, 30)
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Jumlah responden tracer study (lulusan S1 & diploma)
     */
    public function countTracerResponden(array $years, ?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $yearIn = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT hts.id_reg_pd)
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) IN {$yearIn}
                AND sms.id_jenj_didik IN (22, 23, 30)
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Breakdown status lulusan + kategori pekerjaan dari tracer study
     * UMP diambil dari tracer.umr_wilayah berdasarkan id_wil dan tahun lulus (correlated)
     */
    public function getIKU2StatusBreakdown(array $years, ?string $fakultas = null): object
    {
        $umpFallback = self::UMP_FALLBACK;
        $multiplier = self::UMP_MULTIPLIER;
        $bindings = [self::UNILA_ID_SP];
        $yearIn = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT
                COUNT(DISTINCT CASE WHEN hts.status_lulusan = 1 THEN hts.id_reg_pd END) AS bekerja,
                COUNT(DISTINCT CASE WHEN hts.status_lulusan = 2 THEN hts.id_reg_pd END) AS wiraswasta,
                COUNT(DISTINCT CASE WHEN hts.status_lulusan = 3 THEN hts.id_reg_pd END) AS kuliah_lanjut,
                COUNT(DISTINCT CASE WHEN hts.status_lulusan = 4 THEN hts.id_reg_pd END) AS belum_bekerja,
                COUNT(DISTINCT CASE
                    WHEN hts.status_lulusan = 1
                         AND hts.wkt_tunggu IS NOT NULL
                         AND CAST(hts.wkt_tunggu AS INT) < 6
                         AND hts.income_per_bln IS NOT NULL
                         AND hts.income_per_bln > ({$multiplier} * COALESCE(umr.besaran_umr, {$umpFallback}))
                    THEN hts.id_reg_pd END) AS kerja_kat1,
                COUNT(DISTINCT CASE
                    WHEN hts.status_lulusan = 1
                         AND hts.wkt_tunggu IS NOT NULL
                         AND CAST(hts.wkt_tunggu AS INT) >= 6
                         AND CAST(hts.wkt_tunggu AS INT) < 12
                         AND hts.income_per_bln IS NOT NULL
                         AND hts.income_per_bln > ({$multiplier} * COALESCE(umr.besaran_umr, {$umpFallback}))
                    THEN hts.id_reg_pd END) AS kerja_kat2,
                COUNT(DISTINCT CASE
                    WHEN hts.status_lulusan = 1
                         AND hts.wkt_tunggu IS NOT NULL
                         AND CAST(hts.wkt_tunggu AS INT) < 12
                         AND (hts.income_per_bln IS NULL OR hts.income_per_bln <= ({$multiplier} * COALESCE(umr.besaran_umr, {$umpFallback})))
                    THEN hts.id_reg_pd END) AS kerja_kat3
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            LEFT JOIN tracer.umr_wilayah AS umr
                ON umr.id_wil = hts.id_wil
                AND umr.id_tahun_anggaran = YEAR(reg.tgl_keluar)
                AND umr.soft_delete = 0
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) IN {$yearIn}
                AND sms.id_jenj_didik IN (22, 23, 30)
                {$fakFilter}
        ";

        $result = $this->selectOne($sql, $bindings);

        return $result ?? (object) [
            'bekerja' => 0, 'wiraswasta' => 0, 'kuliah_lanjut' => 0, 'belum_bekerja' => 0,
            'kerja_kat1' => 0, 'kerja_kat2' => 0, 'kerja_kat3' => 0,
        ];
    }

    /**
     * Hitung IKU 2 keseluruhan
     */
    public function calculateIKU2(array $years, ?string $fakultas = null): array
    {
        $totalLulusan = $this->countTotalLulusanIKU2($years, $fakultas);
        $totalResponden = $this->countTracerResponden($years, $fakultas);
        $breakdown = $this->getIKU2StatusBreakdown($years, $fakultas);

        $bekerja = (int) $breakdown->bekerja;
        $wiraswasta = (int) $breakdown->wiraswasta;
        $kuliahLanjut = (int) $breakdown->kuliah_lanjut;
        $belumBekerja = (int) $breakdown->belum_bekerja;

        $produktif = $bekerja + $wiraswasta + $kuliahLanjut;
        $persentase = $totalLulusan > 0
            ? round(($produktif / $totalLulusan) * 100, 2)
            : 0;

        $responseRate = $totalLulusan > 0
            ? round(($totalResponden / $totalLulusan) * 100, 1)
            : 0;

        return [
            'persentase' => $persentase,
            'total_lulusan' => $totalLulusan,
            'total_responden' => $totalResponden,
            'response_rate' => $responseRate,
            'bekerja' => $bekerja,
            'wiraswasta' => $wiraswasta,
            'kuliah_lanjut' => $kuliahLanjut,
            'belum_bekerja' => $belumBekerja,
            'kategori_kerja' => [
                'kat1' => (int) $breakdown->kerja_kat1,
                'kat2' => (int) $breakdown->kerja_kat2,
                'kat3' => (int) $breakdown->kerja_kat3,
            ],
        ];
    }

    /**
     * Drilldown IKU 2: per fakultas
     */
    public function getIKU2PerFakultas(array $years): array
    {
        $bindings = [self::UNILA_ID_SP];
        $yearIn1 = $this->buildInClause($years, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $yearIn2 = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), fak.id_sms) AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT CASE
                    WHEN hts.status_lulusan IN (1, 2, 3)
                    THEN hts.id_reg_pd
                END) AS produktif,
                total_sub.total_lulusan
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            INNER JOIN (
                SELECT
                    sms2.id_fak_unila,
                    COUNT(DISTINCT reg2.id_reg_pd) AS total_lulusan
                FROM pdrd.reg_pd AS reg2
                INNER JOIN pdrd.sms AS sms2
                    ON sms2.id_sms = reg2.id_sms
                    AND sms2.soft_delete = 0
                    AND sms2.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS j2
                    ON j2.id_jenj_didik = sms2.id_jenj_didik
                    AND j2.expired_date IS NULL
                WHERE reg2.soft_delete = 0
                    AND reg2.id_jns_keluar = '1'
                    AND reg2.tgl_keluar IS NOT NULL
                    AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND YEAR(reg2.tgl_keluar) IN {$yearIn1}
                    AND sms2.id_jenj_didik IN (22, 23, 30)
                GROUP BY sms2.id_fak_unila
            ) AS total_sub ON total_sub.id_fak_unila = sms.id_fak_unila
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) IN {$yearIn2}
                AND sms.id_jenj_didik IN (22, 23, 30)
            GROUP BY fak.id_sms, fak.nm_lemb, total_sub.total_lulusan
            HAVING total_sub.total_lulusan > 0
            ORDER BY nama_fakultas
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalLulusan = (int) $row->total_lulusan;
            $produktif = (int) $row->produktif;
            $value = $totalLulusan > 0 ? round(($produktif / $totalLulusan) * 100, 2) : 0;

            return [
                'id' => $row->id_fakultas,
                'name' => $row->nama_fakultas,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Drilldown IKU 2: per prodi dalam satu fakultas
     */
    public function getIKU2PerProdi(array $years, string $idFakultas): array
    {
        $bindings = [self::UNILA_ID_SP];
        $yearIn1 = $this->buildInClause($years, $bindings);
        $bindings[] = $idFakultas;
        $bindings[] = self::UNILA_ID_SP;
        $yearIn2 = $this->buildInClause($years, $bindings);
        $bindings[] = $idFakultas;

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_sms) AS id_prodi,
                sms.nm_lemb AS nama_prodi,
                COUNT(DISTINCT CASE
                    WHEN hts.status_lulusan IN (1, 2, 3)
                    THEN hts.id_reg_pd
                END) AS produktif,
                total_sub.total_lulusan
            FROM tracer.hasil_tracer_study AS hts
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = hts.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            INNER JOIN (
                SELECT
                    reg2.id_sms,
                    COUNT(DISTINCT reg2.id_reg_pd) AS total_lulusan
                FROM pdrd.reg_pd AS reg2
                INNER JOIN pdrd.sms AS sms2
                    ON sms2.id_sms = reg2.id_sms
                    AND sms2.soft_delete = 0
                    AND sms2.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS j2
                    ON j2.id_jenj_didik = sms2.id_jenj_didik
                    AND j2.expired_date IS NULL
                WHERE reg2.soft_delete = 0
                    AND reg2.id_jns_keluar = '1'
                    AND reg2.tgl_keluar IS NOT NULL
                    AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND YEAR(reg2.tgl_keluar) IN {$yearIn1}
                    AND sms2.id_jenj_didik IN (22, 23, 30)
                    AND sms2.id_fak_unila = ?
                GROUP BY reg2.id_sms
            ) AS total_sub ON total_sub.id_sms = sms.id_sms
            WHERE hts.soft_delete = 0
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND reg.id_jns_keluar = '1'
                AND reg.tgl_keluar IS NOT NULL
                AND YEAR(reg.tgl_keluar) IN {$yearIn2}
                AND sms.id_jenj_didik IN (22, 23, 30)
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms, sms.nm_lemb, total_sub.total_lulusan
            HAVING total_sub.total_lulusan > 0
            ORDER BY nama_prodi
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalLulusan = (int) $row->total_lulusan;
            $produktif = (int) $row->produktif;
            $value = $totalLulusan > 0 ? round(($produktif / $totalLulusan) * 100, 2) : 0;

            return [
                'id' => $row->id_prodi,
                'name' => $row->nama_prodi,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Trend IKU 2: 5 tahun terakhir
     */
    public function getTrendIKU2(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $data = $this->calculateIKU2([$yr]);

            $trend[] = [
                'name' => (string) $yr,
                'value' => $data['persentase'],
            ];
        }

        return $trend;
    }

    // =========================================
    // IKU 3: MAHASISWA BERKEGIATAN DI LUAR PRODI
    // =========================================

    /**
     * IKU 3: Jenjang S1 & Diploma (D1, D2, D3, D4, S1)
     */
    private const IKU3_JENJANG = [20, 21, 22, 23, 30];

    /**
     * IKU 3: Prestasi minimal tingkat nasional
     * 5 = Nasional, 6 = Internasional
     */
    private const PRESTASI_NASIONAL = [5, 6];

    /**
     * Denominator: Total mahasiswa aktif S1 & Diploma pada semester tertentu
     */
    public function countMahasiswaAktifIKU3(array $semesters, ?string $fakultas = null): int
    {
        $bindings = [];
        $smtIn = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT kmh.id_reg_pd)
            FROM pdrd.kuliah_mhs AS kmh
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenjang
                ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs IN ('A', 'M')
                AND kmh.id_smt IN {$smtIn}
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND sms.id_jenj_didik IN (20, 21, 22, 23, 30)
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Numerator A: Mahasiswa MBKM yang mendapat konversi/ekuivalensi SKS
     * - Kegiatan non-pertukaran pelajar: cek mbkm.konversi_akt_mhs (sks_mk > 0)
     * - Pertukaran pelajar: cek mbkm.ekuiv_transfer (sks_diakui > 0)
     */
    public function countMahasiswaMBKM(array $semesters, ?string $fakultas = null): int
    {
        // Build bindings sequentially matching SQL order: Part 1 then Part 2
        $bindings = [];
        $smtIn1 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilterA = '';
        if ($fakultas) {
            $fakFilterA = " AND sms.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        // Part 2 bindings
        $smtIn2 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilterB = '';
        if ($fakultas) {
            $fakFilterB = " AND sms2.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT COUNT(DISTINCT combined.id_reg_pd)
            FROM (
                -- Non-pertukaran pelajar: pakai konversi_akt_mhs
                SELECT ang.id_reg_pd
                FROM pdrd.anggota_akt_mhs AS ang
                INNER JOIN pdrd.akt_mhs AS akt
                    ON akt.id_akt_mhs = ang.id_akt_mhs AND akt.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns
                    ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs AND jns.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg
                    ON reg.id_reg_pd = ang.id_reg_pd AND reg.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
                WHERE ang.soft_delete = 0
                    AND jns.a_kegiatan_kampus_merdeka = 1
                    AND akt.id_smt IN {$smtIn1}
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND sms.id_jenj_didik IN (20, 21, 22, 23, 30)
                    AND EXISTS (
                        SELECT 1 FROM mbkm.konversi_akt_mhs k
                        WHERE k.id_akt_mhs = akt.id_akt_mhs AND k.soft_delete = 0 AND k.sks_mk > 0
                    )
                    {$fakFilterA}

                UNION

                -- Pertukaran pelajar: pakai ekuiv_transfer
                SELECT ang2.id_reg_pd
                FROM pdrd.anggota_akt_mhs AS ang2
                INNER JOIN pdrd.akt_mhs AS akt2
                    ON akt2.id_akt_mhs = ang2.id_akt_mhs AND akt2.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns2
                    ON jns2.id_jns_akt_mhs = akt2.id_jns_akt_mhs AND jns2.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg2
                    ON reg2.id_reg_pd = ang2.id_reg_pd AND reg2.soft_delete = 0
                INNER JOIN pdrd.sms AS sms2
                    ON sms2.id_sms = reg2.id_sms AND sms2.soft_delete = 0 AND sms2.stat_prodi = 'A'
                WHERE ang2.soft_delete = 0
                    AND jns2.a_kegiatan_kampus_merdeka = 1
                    AND akt2.id_smt IN {$smtIn2}
                    AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND sms2.id_jenj_didik IN (20, 21, 22, 23, 30)
                    AND EXISTS (
                        SELECT 1 FROM mbkm.ekuiv_transfer e
                        WHERE e.id_reg_pd = ang2.id_reg_pd AND e.id_akt_mhs = akt2.id_akt_mhs
                            AND e.soft_delete = 0 AND e.sks_diakui > 0
                    )
                    {$fakFilterB}
            ) AS combined
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Numerator B: Mahasiswa aktif dengan prestasi minimal tingkat nasional
     */
    public function countMahasiswaPrestasiNasional(array $years, array $semesters, ?string $fakultas = null): int
    {
        $bindings = [];
        $smtIn = $this->buildInClause($semesters, $bindings);
        $yearIn = $this->buildInClause($years, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT reg.id_reg_pd)
            FROM pdrd.prestasi AS p
            INNER JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            INNER JOIN pdrd.kuliah_mhs AS kmh
                ON kmh.id_reg_pd = reg.id_reg_pd AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs IN ('A', 'M') AND kmh.id_smt IN {$smtIn}
            WHERE p.soft_delete = 0
                AND p.id_tkt_prestasi IN (5, 6)
                AND p.thn_prestasi IN {$yearIn}
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND sms.id_jenj_didik IN (20, 21, 22, 23, 30)
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Numerator total (UNION): mahasiswa MBKM OR prestasi nasional (tanpa double-count)
     */
    public function countIKU3Numerator(array $semesters, array $years, ?string $fakultas = null): int
    {
        $bindings = [];

        // A1: non-pertukaran
        $smtInA1 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilterA = '';
        if ($fakultas) {
            $fakFilterA = " AND sms.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        // A2: pertukaran
        $smtInA2 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilterA2 = '';
        if ($fakultas) {
            $fakFilterA2 = " AND sms2.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        // B: prestasi
        $smtInB = $this->buildInClause($semesters, $bindings);
        $yearInB = $this->buildInClause($years, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilterB = '';
        if ($fakultas) {
            $fakFilterB = " AND sms3.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT COUNT(DISTINCT combined.id_reg_pd)
            FROM (
                -- A1: MBKM non-pertukaran (konversi_akt_mhs)
                SELECT ang.id_reg_pd
                FROM pdrd.anggota_akt_mhs AS ang
                INNER JOIN pdrd.akt_mhs AS akt
                    ON akt.id_akt_mhs = ang.id_akt_mhs AND akt.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns
                    ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs AND jns.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg
                    ON reg.id_reg_pd = ang.id_reg_pd AND reg.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
                WHERE ang.soft_delete = 0
                    AND jns.a_kegiatan_kampus_merdeka = 1
                    AND akt.id_smt IN {$smtInA1}
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND sms.id_jenj_didik IN (20, 21, 22, 23, 30)
                    AND EXISTS (
                        SELECT 1 FROM mbkm.konversi_akt_mhs k
                        WHERE k.id_akt_mhs = akt.id_akt_mhs AND k.soft_delete = 0 AND k.sks_mk > 0
                    )
                    {$fakFilterA}

                UNION

                -- A2: Pertukaran pelajar (ekuiv_transfer)
                SELECT ang2.id_reg_pd
                FROM pdrd.anggota_akt_mhs AS ang2
                INNER JOIN pdrd.akt_mhs AS akt2
                    ON akt2.id_akt_mhs = ang2.id_akt_mhs AND akt2.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns2
                    ON jns2.id_jns_akt_mhs = akt2.id_jns_akt_mhs AND jns2.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg2
                    ON reg2.id_reg_pd = ang2.id_reg_pd AND reg2.soft_delete = 0
                INNER JOIN pdrd.sms AS sms2
                    ON sms2.id_sms = reg2.id_sms AND sms2.soft_delete = 0 AND sms2.stat_prodi = 'A'
                WHERE ang2.soft_delete = 0
                    AND jns2.a_kegiatan_kampus_merdeka = 1
                    AND akt2.id_smt IN {$smtInA2}
                    AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND sms2.id_jenj_didik IN (20, 21, 22, 23, 30)
                    AND EXISTS (
                        SELECT 1 FROM mbkm.ekuiv_transfer e
                        WHERE e.id_reg_pd = ang2.id_reg_pd AND e.id_akt_mhs = akt2.id_akt_mhs
                            AND e.soft_delete = 0 AND e.sks_diakui > 0
                    )
                    {$fakFilterA2}

                UNION

                -- B: Prestasi minimal nasional
                SELECT reg3.id_reg_pd
                FROM pdrd.prestasi AS p
                INNER JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
                INNER JOIN pdrd.reg_pd AS reg3
                    ON reg3.id_pd = pd.id_pd AND reg3.soft_delete = 0
                INNER JOIN pdrd.sms AS sms3
                    ON sms3.id_sms = reg3.id_sms AND sms3.soft_delete = 0 AND sms3.stat_prodi = 'A'
                INNER JOIN pdrd.kuliah_mhs AS kmh
                    ON kmh.id_reg_pd = reg3.id_reg_pd AND kmh.soft_delete = 0
                    AND kmh.id_stat_mhs IN ('A', 'M') AND kmh.id_smt IN {$smtInB}
                WHERE p.soft_delete = 0
                    AND p.id_tkt_prestasi IN (5, 6)
                    AND p.thn_prestasi IN {$yearInB}
                    AND CAST(reg3.id_sp AS VARCHAR(50)) = ?
                    AND sms3.id_jenj_didik IN (20, 21, 22, 23, 30)
                    {$fakFilterB}
            ) AS combined
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Hitung IKU 3 keseluruhan
     */
    public function calculateIKU3(array $semesters, array $years, ?string $fakultas = null): array
    {
        $totalAktif = $this->countMahasiswaAktifIKU3($semesters, $fakultas);
        $mbkm = $this->countMahasiswaMBKM($semesters, $fakultas);
        $prestasi = $this->countMahasiswaPrestasiNasional($years, $semesters, $fakultas);
        $totalBerkegiatan = $this->countIKU3Numerator($semesters, $years, $fakultas);

        $persentase = $totalAktif > 0
            ? round(($totalBerkegiatan / $totalAktif) * 100, 2)
            : 0;

        return [
            'persentase' => $persentase,
            'total_aktif' => $totalAktif,
            'mbkm' => $mbkm,
            'prestasi_nasional' => $prestasi,
            'total_berkegiatan' => $totalBerkegiatan,
        ];
    }

    /**
     * Breakdown per jenis kegiatan MBKM
     */
    public function getIKU3Breakdown(array $semesters, ?string $fakultas = null): array
    {
        $bindings = [];
        $smtIn = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT
                jns.nm_jns_akt_mhs AS jenis_kegiatan,
                COUNT(DISTINCT ang.id_reg_pd) AS jumlah_mahasiswa
            FROM pdrd.anggota_akt_mhs AS ang
            INNER JOIN pdrd.akt_mhs AS akt
                ON akt.id_akt_mhs = ang.id_akt_mhs AND akt.soft_delete = 0
            INNER JOIN ref.jenis_akt_mhs AS jns
                ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs AND jns.expired_date IS NULL
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = ang.id_reg_pd AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE ang.soft_delete = 0
                AND jns.a_kegiatan_kampus_merdeka = 1
                AND akt.id_smt IN {$smtIn}
                AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                AND sms.id_jenj_didik IN (20, 21, 22, 23, 30)
                {$fakFilter}
            GROUP BY jns.id_jns_akt_mhs, jns.nm_jns_akt_mhs
            ORDER BY jumlah_mahasiswa DESC
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            return [
                'jenis_kegiatan' => $row->jenis_kegiatan,
                'jumlah_mahasiswa' => (int) $row->jumlah_mahasiswa,
            ];
        }, $results);
    }

    /**
     * Drilldown IKU 3: per fakultas
     */
    public function getIKU3PerFakultas(array $semesters, array $years): array
    {
        // Bindings in SQL order: A1(smt,idsp), A2(smt,idsp), B(smt,year,idsp), denom(smt,idsp)
        $bindings = [];

        // A1
        $smtInA1 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;

        // A2
        $smtInA2 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;

        // B
        $smtInB = $this->buildInClause($semesters, $bindings);
        $yearInB = $this->buildInClause($years, $bindings);
        $bindings[] = self::UNILA_ID_SP;

        // denom
        $smtInD = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), fak.id_sms) AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                denom.total_aktif,
                COUNT(DISTINCT numerator.id_reg_pd) AS total_berkegiatan
            FROM (
                -- Numerator UNION
                SELECT ang.id_reg_pd, reg.id_sms
                FROM pdrd.anggota_akt_mhs AS ang
                INNER JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = ang.id_akt_mhs AND akt.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs AND jns.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = ang.id_reg_pd AND reg.soft_delete = 0
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
                WHERE ang.soft_delete = 0 AND jns.a_kegiatan_kampus_merdeka = 1
                    AND akt.id_smt IN {$smtInA1} AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND sms.id_jenj_didik IN (20,21,22,23,30)
                    AND EXISTS (SELECT 1 FROM mbkm.konversi_akt_mhs k WHERE k.id_akt_mhs = akt.id_akt_mhs AND k.soft_delete = 0 AND k.sks_mk > 0)

                UNION

                SELECT ang2.id_reg_pd, reg2.id_sms
                FROM pdrd.anggota_akt_mhs AS ang2
                INNER JOIN pdrd.akt_mhs AS akt2 ON akt2.id_akt_mhs = ang2.id_akt_mhs AND akt2.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns2 ON jns2.id_jns_akt_mhs = akt2.id_jns_akt_mhs AND jns2.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg2 ON reg2.id_reg_pd = ang2.id_reg_pd AND reg2.soft_delete = 0
                INNER JOIN pdrd.sms AS sms2 ON sms2.id_sms = reg2.id_sms AND sms2.soft_delete = 0 AND sms2.stat_prodi = 'A'
                WHERE ang2.soft_delete = 0 AND jns2.a_kegiatan_kampus_merdeka = 1
                    AND akt2.id_smt IN {$smtInA2} AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND sms2.id_jenj_didik IN (20,21,22,23,30)
                    AND EXISTS (SELECT 1 FROM mbkm.ekuiv_transfer e WHERE e.id_reg_pd = ang2.id_reg_pd AND e.id_akt_mhs = akt2.id_akt_mhs AND e.soft_delete = 0 AND e.sks_diakui > 0)

                UNION

                SELECT reg3.id_reg_pd, reg3.id_sms
                FROM pdrd.prestasi AS p
                INNER JOIN pdrd.peserta_didik AS pd ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
                INNER JOIN pdrd.reg_pd AS reg3 ON reg3.id_pd = pd.id_pd AND reg3.soft_delete = 0
                INNER JOIN pdrd.sms AS sms3 ON sms3.id_sms = reg3.id_sms AND sms3.soft_delete = 0 AND sms3.stat_prodi = 'A'
                INNER JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg3.id_reg_pd AND kmh.soft_delete = 0 AND kmh.id_stat_mhs IN ('A', 'M') AND kmh.id_smt IN {$smtInB}
                WHERE p.soft_delete = 0 AND p.id_tkt_prestasi IN (5,6) AND p.thn_prestasi IN {$yearInB}
                    AND CAST(reg3.id_sp AS VARCHAR(50)) = ?
                    AND sms3.id_jenj_didik IN (20,21,22,23,30)
            ) AS numerator
            INNER JOIN pdrd.sms AS prodi
                ON prodi.id_sms = numerator.id_sms AND prodi.soft_delete = 0
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = prodi.id_fak_unila AND fak.soft_delete = 0
            INNER JOIN (
                SELECT sms_d.id_fak_unila, COUNT(DISTINCT kmh_d.id_reg_pd) AS total_aktif
                FROM pdrd.kuliah_mhs AS kmh_d
                INNER JOIN pdrd.reg_pd AS reg_d ON reg_d.id_reg_pd = kmh_d.id_reg_pd AND reg_d.soft_delete = 0
                INNER JOIN pdrd.sms AS sms_d ON sms_d.id_sms = reg_d.id_sms AND sms_d.soft_delete = 0 AND sms_d.stat_prodi = 'A'
                WHERE kmh_d.soft_delete = 0 AND kmh_d.id_stat_mhs IN ('A', 'M') AND kmh_d.id_smt IN {$smtInD}
                    AND CAST(reg_d.id_sp AS VARCHAR(50)) = ?
                    AND sms_d.id_jenj_didik IN (20,21,22,23,30)
                GROUP BY sms_d.id_fak_unila
            ) AS denom ON denom.id_fak_unila = prodi.id_fak_unila
            GROUP BY fak.id_sms, fak.nm_lemb, denom.total_aktif
            HAVING denom.total_aktif > 0
            ORDER BY nama_fakultas
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalAktif = (int) $row->total_aktif;
            $berkegiatan = (int) $row->total_berkegiatan;
            $value = $totalAktif > 0 ? round(($berkegiatan / $totalAktif) * 100, 2) : 0;

            return [
                'id' => $row->id_fakultas,
                'name' => $row->nama_fakultas,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Drilldown IKU 3: per prodi dalam satu fakultas
     */
    public function getIKU3PerProdi(array $semesters, array $years, string $idFakultas): array
    {
        $bindings = [];

        // A1
        $smtInA1 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $bindings[] = $idFakultas;

        // A2
        $smtInA2 = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $bindings[] = $idFakultas;

        // B
        $smtInB = $this->buildInClause($semesters, $bindings);
        $yearInB = $this->buildInClause($years, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $bindings[] = $idFakultas;

        // denom
        $smtInD = $this->buildInClause($semesters, $bindings);
        $bindings[] = self::UNILA_ID_SP;
        $bindings[] = $idFakultas;

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), prodi.id_sms) AS id_prodi,
                prodi.nm_lemb AS nama_prodi,
                denom.total_aktif,
                COUNT(DISTINCT numerator.id_reg_pd) AS total_berkegiatan
            FROM (
                SELECT ang.id_reg_pd, reg.id_sms
                FROM pdrd.anggota_akt_mhs AS ang
                INNER JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs = ang.id_akt_mhs AND akt.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns ON jns.id_jns_akt_mhs = akt.id_jns_akt_mhs AND jns.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = ang.id_reg_pd AND reg.soft_delete = 0
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
                WHERE ang.soft_delete = 0 AND jns.a_kegiatan_kampus_merdeka = 1
                    AND akt.id_smt IN {$smtInA1} AND CAST(reg.id_sp AS VARCHAR(50)) = ?
                    AND sms.id_jenj_didik IN (20,21,22,23,30) AND sms.id_fak_unila = ?
                    AND EXISTS (SELECT 1 FROM mbkm.konversi_akt_mhs k WHERE k.id_akt_mhs = akt.id_akt_mhs AND k.soft_delete = 0 AND k.sks_mk > 0)

                UNION

                SELECT ang2.id_reg_pd, reg2.id_sms
                FROM pdrd.anggota_akt_mhs AS ang2
                INNER JOIN pdrd.akt_mhs AS akt2 ON akt2.id_akt_mhs = ang2.id_akt_mhs AND akt2.soft_delete = 0
                INNER JOIN ref.jenis_akt_mhs AS jns2 ON jns2.id_jns_akt_mhs = akt2.id_jns_akt_mhs AND jns2.expired_date IS NULL
                INNER JOIN pdrd.reg_pd AS reg2 ON reg2.id_reg_pd = ang2.id_reg_pd AND reg2.soft_delete = 0
                INNER JOIN pdrd.sms AS sms2 ON sms2.id_sms = reg2.id_sms AND sms2.soft_delete = 0 AND sms2.stat_prodi = 'A'
                WHERE ang2.soft_delete = 0 AND jns2.a_kegiatan_kampus_merdeka = 1
                    AND akt2.id_smt IN {$smtInA2} AND CAST(reg2.id_sp AS VARCHAR(50)) = ?
                    AND sms2.id_jenj_didik IN (20,21,22,23,30) AND sms2.id_fak_unila = ?
                    AND EXISTS (SELECT 1 FROM mbkm.ekuiv_transfer e WHERE e.id_reg_pd = ang2.id_reg_pd AND e.id_akt_mhs = akt2.id_akt_mhs AND e.soft_delete = 0 AND e.sks_diakui > 0)

                UNION

                SELECT reg3.id_reg_pd, reg3.id_sms
                FROM pdrd.prestasi AS p
                INNER JOIN pdrd.peserta_didik AS pd ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
                INNER JOIN pdrd.reg_pd AS reg3 ON reg3.id_pd = pd.id_pd AND reg3.soft_delete = 0
                INNER JOIN pdrd.sms AS sms3 ON sms3.id_sms = reg3.id_sms AND sms3.soft_delete = 0 AND sms3.stat_prodi = 'A'
                INNER JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg3.id_reg_pd AND kmh.soft_delete = 0 AND kmh.id_stat_mhs IN ('A', 'M') AND kmh.id_smt IN {$smtInB}
                WHERE p.soft_delete = 0 AND p.id_tkt_prestasi IN (5,6) AND p.thn_prestasi IN {$yearInB}
                    AND CAST(reg3.id_sp AS VARCHAR(50)) = ?
                    AND sms3.id_jenj_didik IN (20,21,22,23,30) AND sms3.id_fak_unila = ?
            ) AS numerator
            INNER JOIN pdrd.sms AS prodi
                ON prodi.id_sms = numerator.id_sms AND prodi.soft_delete = 0
            INNER JOIN (
                SELECT reg_d.id_sms, COUNT(DISTINCT kmh_d.id_reg_pd) AS total_aktif
                FROM pdrd.kuliah_mhs AS kmh_d
                INNER JOIN pdrd.reg_pd AS reg_d ON reg_d.id_reg_pd = kmh_d.id_reg_pd AND reg_d.soft_delete = 0
                INNER JOIN pdrd.sms AS sms_d ON sms_d.id_sms = reg_d.id_sms AND sms_d.soft_delete = 0 AND sms_d.stat_prodi = 'A'
                WHERE kmh_d.soft_delete = 0 AND kmh_d.id_stat_mhs IN ('A', 'M') AND kmh_d.id_smt IN {$smtInD}
                    AND CAST(reg_d.id_sp AS VARCHAR(50)) = ?
                    AND sms_d.id_jenj_didik IN (20,21,22,23,30) AND sms_d.id_fak_unila = ?
                GROUP BY reg_d.id_sms
            ) AS denom ON denom.id_sms = numerator.id_sms
            GROUP BY prodi.id_sms, prodi.nm_lemb, denom.total_aktif
            HAVING denom.total_aktif > 0
            ORDER BY nama_prodi
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalAktif = (int) $row->total_aktif;
            $berkegiatan = (int) $row->total_berkegiatan;
            $value = $totalAktif > 0 ? round(($berkegiatan / $totalAktif) * 100, 2) : 0;

            return [
                'id' => $row->id_prodi,
                'name' => $row->nama_prodi,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Trend IKU 3: 5 tahun terakhir
     */
    public function getTrendIKU3(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $data = $this->calculateIKU3([$yr . '1'], [$yr]);

            $trend[] = [
                'name' => (string) $yr,
                'value' => $data['persentase'],
            ];
        }

        return $trend;
    }

    // =========================================
    // IKU 5: RASIO LUARAN KERJASAMA
    // =========================================

    /**
     * Luaran condition: sms_kerjasama has non-empty output fields
     */
    private const LUARAN_CONDITION = "
        (sk.hsl_prod_brg IS NOT NULL AND sk.hsl_prod_brg <> '')
        OR (sk.hsl_prod_jasa IS NOT NULL AND sk.hsl_prod_jasa <> '')
        OR (sk.prestasi_penghargaan IS NOT NULL AND sk.prestasi_penghargaan <> '')
    ";

    /**
     * Build MoU overlap filter: MoU berlaku di range tahun filter
     */
    private function buildMouYearOverlap(array $years, array &$bindings): string
    {
        $minYear = min($years);
        $maxYear = max($years);
        $bindings[] = "{$minYear}-01-01";
        $bindings[] = "{$maxYear}-12-31";
        return "m.tgl_selesai >= ? AND m.tgl_mulai <= ?";
    }

    /**
     * Pembilang: Jumlah luaran hasil kerjasama (sms_kerjasama dengan output)
     */
    public function countLuaranKerjasama(array $years, ?string $fakultas = null): int
    {
        $bindings = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT COUNT(DISTINCT sk.id_sms_kerjasama)
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m
                ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms
                ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
                AND ({$mouYear})
                AND (" . self::LUARAN_CONDITION . ")
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Penyebut: Total dosen aktif PT
     * Reuse logic dari DosenRepository
     */
    public function countTotalDosenIKU5(?string $fakultas = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = '';
        if ($fakultas) {
            $bindings[] = $fakultas;
            $fakFilter = " AND s.id_fak_unila = ?";
        }

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk
                ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
            INNER JOIN pdrd.sms s
                ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = 12
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Hitung IKU 5 keseluruhan
     */
    public function calculateIKU5(array $years, ?string $fakultas = null): array
    {
        $totalLuaran = $this->countLuaranKerjasama($years, $fakultas);
        $totalDosen = $this->countTotalDosenIKU5($fakultas);

        $rasio = $totalDosen > 0
            ? round(($totalLuaran / $totalDosen) * 100, 2)
            : 0;

        return [
            'rasio' => $rasio,
            'total_luaran' => $totalLuaran,
            'total_dosen' => $totalDosen,
        ];
    }

    /**
     * Breakdown IKU 5 per aktivitas kerjasama
     */
    public function getIKU5Breakdown(array $years, ?string $fakultas = null): array
    {
        $bindings = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT
                ISNULL(ak.nm_akt_kerjasama, 'Tidak Diketahui') AS name,
                COUNT(DISTINCT sk.id_sms_kerjasama) AS value
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m
                ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            LEFT JOIN ref.aktifitas_kerjasama ak
                ON CAST(m.id_akt_kerjasama AS VARCHAR) = CAST(ak.id_akt_kerjasama AS VARCHAR)
            INNER JOIN pdrd.sms sms
                ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
                AND ({$mouYear})
                AND (" . self::LUARAN_CONDITION . ")
                {$fakFilter}
            GROUP BY ak.nm_akt_kerjasama
            ORDER BY value DESC
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            return [
                'name' => $row->name,
                'value' => (int) $row->value,
            ];
        }, $results);
    }

    /**
     * Drilldown IKU 5: per fakultas
     */
    public function getIKU5PerFakultas(array $years): array
    {
        $bindings = [];
        // denominator subquery appears first in SQL (INNER JOIN)
        $bindings[] = self::UNILA_ID_SP;
        // numerator WHERE clause
        $mouYearN = $this->buildMouYearOverlap($years, $bindings);

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), fak.id_sms) AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT sk.id_sms_kerjasama) AS total_luaran,
                denom.total_dosen
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m
                ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms
                ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            INNER JOIN pdrd.sms fak
                ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0
            INNER JOIN (
                SELECT s.id_fak_unila, COUNT(DISTINCT sdm.id_sdm) AS total_dosen
                FROM pdrd.sdm sdm
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
                WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                GROUP BY s.id_fak_unila
            ) AS denom ON denom.id_fak_unila = sms.id_fak_unila
            WHERE sk.soft_delete = 0
                AND ({$mouYearN})
                AND (" . self::LUARAN_CONDITION . ")
            GROUP BY fak.id_sms, fak.nm_lemb, denom.total_dosen
            HAVING denom.total_dosen > 0
            ORDER BY nama_fakultas
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalDosen = (int) $row->total_dosen;
            $totalLuaran = (int) $row->total_luaran;
            $value = $totalDosen > 0 ? round(($totalLuaran / $totalDosen) * 100, 2) : 0;

            return [
                'id' => $row->id_fakultas,
                'name' => $row->nama_fakultas,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Drilldown IKU 5: per prodi dalam satu fakultas
     */
    public function getIKU5PerProdi(array $years, string $idFakultas): array
    {
        $bindings = [];
        // denominator (subquery appears first in SQL via INNER JOIN)
        $bindings[] = self::UNILA_ID_SP;
        $bindings[] = $idFakultas;
        // numerator WHERE clause
        $mouYearN = $this->buildMouYearOverlap($years, $bindings);
        $bindings[] = $idFakultas;

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_sms) AS id_prodi,
                sms.nm_lemb AS nama_prodi,
                COUNT(DISTINCT sk.id_sms_kerjasama) AS total_luaran,
                denom.total_dosen
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m
                ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms
                ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            INNER JOIN (
                SELECT ptk.id_sms, COUNT(DISTINCT sdm.id_sdm) AS total_dosen
                FROM pdrd.sdm sdm
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
                WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                    AND s.id_fak_unila = ?
                GROUP BY ptk.id_sms
            ) AS denom ON denom.id_sms = sms.id_sms
            WHERE sk.soft_delete = 0
                AND ({$mouYearN})
                AND (" . self::LUARAN_CONDITION . ")
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms, sms.nm_lemb, denom.total_dosen
            HAVING denom.total_dosen > 0
            ORDER BY nama_prodi
        ";

        $results = $this->select($sql, $bindings);

        return array_map(function ($row) {
            $totalDosen = (int) $row->total_dosen;
            $totalLuaran = (int) $row->total_luaran;
            $value = $totalDosen > 0 ? round(($totalLuaran / $totalDosen) * 100, 2) : 0;

            return [
                'id' => $row->id_prodi,
                'name' => $row->nama_prodi,
                'value' => $value,
            ];
        }, $results);
    }

    /**
     * Trend IKU 5: 5 tahun terakhir
     */
    public function getTrendIKU5(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $data = $this->calculateIKU5([$yr]);

            $trend[] = [
                'name' => (string) $yr,
                'value' => $data['rasio'],
            ];
        }

        return $trend;
    }

    // =========================================
    // IKU 7: KETERLIBATAN PT DALAM SDGs
    // Pendekatan: keyword matching pada judul litabmas
    //             + kerjasama otomatis = SDG 17
    // =========================================

    /**
     * Build LIKE conditions dari SDG keywords config.
     * Hanya untuk target SDGs (wajib + pilihan).
     * Keywords dari config, bukan user input → aman di-inline.
     */
    private function buildSdgLikeCondition(string $column): string
    {
        $wajib = config('iku.sdg.sdg_wajib', [1, 4, 17]);
        $pilihan = config('iku.sdg.sdg_pilihan', []);
        $targetSdgs = array_merge($wajib, $pilihan);
        $allKeywords = config('iku.sdg.sdg_keywords', []);

        $conditions = [];
        foreach ($targetSdgs as $sdg) {
            $keywords = $allKeywords[$sdg] ?? [];
            foreach ($keywords as $kw) {
                $escaped = str_replace("'", "''", strtolower($kw));
                $conditions[] = "LOWER({$column}) LIKE '%{$escaped}%'";
            }
        }

        if (empty($conditions)) {
            return '1=0';
        }
        return '(' . implode(' OR ', $conditions) . ')';
    }

    /**
     * Build LIKE conditions untuk satu SDG tertentu.
     */
    private function buildSdgLikeForOne(string $column, int $sdgNumber): string
    {
        $allKeywords = config('iku.sdg.sdg_keywords', []);
        $keywords = $allKeywords[$sdgNumber] ?? [];

        $conditions = [];
        foreach ($keywords as $kw) {
            $escaped = str_replace("'", "''", strtolower($kw));
            $conditions[] = "LOWER({$column}) LIKE '%{$escaped}%'";
        }

        if (empty($conditions)) {
            return '1=0';
        }
        return '(' . implode(' OR ', $conditions) . ')';
    }

    /**
     * Total kegiatan Tri Dharma = litabmas + kerjasama (MoU aktif)
     */
    public function countTotalTriDharma(array $years, ?string $fakultas = null): array
    {
        // Litabmas count
        $bindings1 = [];
        $inClause = $this->buildInClause($years, $bindings1);
        $fakFilter1 = '';
        if ($fakultas) {
            $fakFilter1 = " AND EXISTS (
                SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
                WHERE sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
                    AND s.id_fak_unila = ?
            )";
            $bindings1[] = self::UNILA_ID_SP;
            $bindings1[] = $fakultas;
        }

        $sqlLitabmas = "
            SELECT COUNT(DISTINCT l.id_litabmas)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$fakFilter1}
        ";
        $totalLitabmas = (int) $this->selectScalar($sqlLitabmas, $bindings1);

        // Kerjasama count (MoU overlap)
        $bindings2 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings2);
        $fakFilter2 = $this->buildFakultasFilter($fakultas, $bindings2, 'sms');

        $sqlKerjasama = "
            SELECT COUNT(DISTINCT sk.id_sms_kerjasama)
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
              AND ({$mouYear})
              {$fakFilter2}
        ";
        $totalKerjasama = (int) $this->selectScalar($sqlKerjasama, $bindings2);

        return [
            'litabmas' => $totalLitabmas,
            'kerjasama' => $totalKerjasama,
            'total' => $totalLitabmas + $totalKerjasama,
        ];
    }

    /**
     * Litabmas yang match keyword SDG target
     */
    public function countLitabmasSDG(array $years, ?string $fakultas = null): int
    {
        $sdgCondition = $this->buildSdgLikeCondition('l.judul_litabmas');

        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = '';
        if ($fakultas) {
            $fakFilter = " AND EXISTS (
                SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
                WHERE sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
                    AND s.id_fak_unila = ?
            )";
            $bindings[] = self::UNILA_ID_SP;
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT COUNT(DISTINCT l.id_litabmas)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              AND {$sdgCondition}
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Hitung IKU 7.
     * Numerator = litabmas matching SDG keywords + semua kerjasama (SDG 17)
     * Denominator = total litabmas + total kerjasama
     */
    public function calculateIKU7(array $years, ?string $fakultas = null): array
    {
        $totals = $this->countTotalTriDharma($years, $fakultas);
        $litabmasSDG = $this->countLitabmasSDG($years, $fakultas);

        // Semua kerjasama = SDG 17 (Kemitraan)
        $kegiatanSDG = $litabmasSDG + $totals['kerjasama'];
        $denominator = $totals['total'];

        $persentase = $denominator > 0
            ? round(($kegiatanSDG / $denominator) * 100, 2)
            : 0;

        return [
            'persentase' => $persentase,
            'kegiatan_sdg' => $kegiatanSDG,
            'litabmas_sdg' => $litabmasSDG,
            'kerjasama_sdg' => $totals['kerjasama'],
            'total_kegiatan' => $denominator,
            'total_litabmas' => $totals['litabmas'],
            'total_kerjasama' => $totals['kerjasama'],
        ];
    }

    /**
     * Breakdown per SDG: berapa litabmas yang match per SDG
     * + kerjasama untuk SDG 17
     */
    public function getSDGBreakdown(array $years, ?string $fakultas = null): array
    {
        $wajib = config('iku.sdg.sdg_wajib', [1, 4, 17]);
        $pilihan = config('iku.sdg.sdg_pilihan', []);
        $targetSdgs = array_merge($wajib, $pilihan);
        $labels = config('iku.sdg.sdg_labels', []);

        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = '';
        if ($fakultas) {
            $fakFilter = " AND EXISTS (
                SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
                WHERE sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
                    AND s.id_fak_unila = ?
            )";
            $bindings[] = self::UNILA_ID_SP;
            $bindings[] = $fakultas;
        }

        // Build one query with CASE per SDG
        $caseExpressions = [];
        foreach ($targetSdgs as $sdg) {
            $likeCondition = $this->buildSdgLikeForOne('l.judul_litabmas', $sdg);
            $caseExpressions[] = "SUM(CASE WHEN {$likeCondition} THEN 1 ELSE 0 END) AS sdg_{$sdg}";
        }

        $sql = "
            SELECT " . implode(",\n                   ", $caseExpressions) . "
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
              {$fakFilter}
        ";

        $row = $this->selectOne($sql, $bindings);

        // Kerjasama count untuk SDG 17
        $bindings2 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings2);
        $fakFilter2 = $this->buildFakultasFilter($fakultas, $bindings2, 'sms');

        $sqlKerjasama = "
            SELECT COUNT(DISTINCT sk.id_sms_kerjasama)
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
              AND ({$mouYear})
              {$fakFilter2}
        ";
        $kerjasamaCount = (int) $this->selectScalar($sqlKerjasama, $bindings2);

        $result = [];
        foreach ($targetSdgs as $sdg) {
            $count = (int) ($row->{"sdg_{$sdg}"} ?? 0);
            if ($sdg === 17) {
                $count += $kerjasamaCount;
            }
            $result[] = [
                'sdg' => $sdg,
                'name' => "SDG {$sdg}: " . ($labels[$sdg] ?? ''),
                'value' => $count,
            ];
        }

        usort($result, fn($a, $b) => $b['value'] - $a['value']);

        return $result;
    }

    /**
     * Trend IKU 7 (5 tahun)
     */
    public function getTrendIKU7(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $data = $this->calculateIKU7([$yr]);
            $trend[] = [
                'name' => (string) $yr,
                'value' => $data['persentase'],
            ];
        }

        return $trend;
    }

    /**
     * IKU 7 per Fakultas (drilldown)
     */
    public function getIKU7PerFakultas(array $years): array
    {
        $sdgCondition = $this->buildSdgLikeCondition('l.judul_litabmas');

        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                uo.id_organisasi as id,
                uo.nm_lemb as name,
                COUNT(DISTINCT CASE WHEN {$sdgCondition} THEN l.id_litabmas END) as litabmas_sdg,
                COUNT(DISTINCT l.id_litabmas) as total_litabmas
            FROM pdrd.litabmas l
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY uo.nm_lemb
        ";

        $rows = $this->select($sql, $bindings);

        // Kerjasama per fakultas
        $bindings2 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings2);

        $sqlKerja = "
            SELECT
                uo.id_organisasi as id,
                COUNT(DISTINCT sk.id_sms_kerjasama) as kerjasama_count
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            INNER JOIN man_akses.unit_organisasi uo ON sms.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE sk.soft_delete = 0
              AND ({$mouYear})
            GROUP BY uo.id_organisasi
        ";
        $kerjaRows = $this->select($sqlKerja, $bindings2);
        $kerjaMap = [];
        foreach ($kerjaRows as $kr) {
            $kerjaMap[$kr->id] = (int) $kr->kerjasama_count;
        }

        $result = [];
        foreach ($rows as $r) {
            $kerjasama = $kerjaMap[$r->id] ?? 0;
            $numerator = (int) $r->litabmas_sdg + $kerjasama;
            $denominator = (int) $r->total_litabmas + $kerjasama;
            $value = $denominator > 0 ? round(($numerator / $denominator) * 100, 1) : 0;

            $result[] = [
                'id' => $r->id,
                'name' => $r->name,
                'value' => $value,
            ];
        }

        return $result;
    }

    /**
     * IKU 7 per Prodi (drilldown child)
     */
    public function getIKU7PerProdi(array $years, string $idFakultas): array
    {
        $sdgCondition = $this->buildSdgLikeCondition('l.judul_litabmas');

        $bindings = [self::UNILA_ID_SP, $idFakultas];
        $inClause = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT
                s.id_sms as id,
                s.nm_lemb as name,
                COUNT(DISTINCT CASE WHEN {$sdgCondition} THEN l.id_litabmas END) as litabmas_sdg,
                COUNT(DISTINCT l.id_litabmas) as total_litabmas
            FROM pdrd.litabmas l
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0 AND s.id_fak_unila = ?
            WHERE l.soft_delete = 0
              AND CAST(l.id_thn_kegiatan AS VARCHAR) IN {$inClause}
            GROUP BY s.id_sms, s.nm_lemb
            ORDER BY s.nm_lemb
        ";

        $rows = $this->select($sql, $bindings);

        // Kerjasama per prodi
        $bindings2 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings2);
        $bindings2[] = $idFakultas;

        $sqlKerja = "
            SELECT
                sms.id_sms as id,
                COUNT(DISTINCT sk.id_sms_kerjasama) as kerjasama_count
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
                AND sms.id_fak_unila = ?
            WHERE sk.soft_delete = 0
              AND ({$mouYear})
            GROUP BY sms.id_sms
        ";
        $kerjaRows = $this->select($sqlKerja, $bindings2);
        $kerjaMap = [];
        foreach ($kerjaRows as $kr) {
            $kerjaMap[$kr->id] = (int) $kr->kerjasama_count;
        }

        $result = [];
        foreach ($rows as $r) {
            $kerjasama = $kerjaMap[$r->id] ?? 0;
            $numerator = (int) $r->litabmas_sdg + $kerjasama;
            $denominator = (int) $r->total_litabmas + $kerjasama;
            $value = $denominator > 0 ? round(($numerator / $denominator) * 100, 1) : 0;

            $result[] = [
                'id' => $r->id,
                'name' => $r->name,
                'value' => $value,
            ];
        }

        return $result;
    }

    // =========================================
    // IKU 9: PENDAPATAN NON PENDIDIKAN / NON-UKT
    // Formula: (Pendapatan Non Mahasiswa / Total Pendapatan PT) × 100
    // Pendapatan Mahasiswa (A) = UKT/SPP
    // Pendapatan Non-Mhs (B) = Litabmas + Kerjasama + Biaya Operasional (pemasukan)
    // =========================================

    /**
     * Pendapatan Mahasiswa: total UKT/SPP dari keuangan.spp_mhs
     * Filter by tahun (LEFT 4 digit dari id_smt)
     */
    public function getUKTRevenue(array $years): float
    {
        $bindings = [];
        $yearIn = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND LEFT(CAST(sm.id_smt AS VARCHAR), 4) IN {$yearIn}
        ";

        return (float) $this->selectScalar($sql, $bindings);
    }

    /**
     * Pendapatan Non-Mhs: Dana litabmas (penelitian & PkM)
     * Sumber: dana_dikti + dana_pt + dana_institusi_lain
     */
    public function getLitabmasRevenue(array $years, ?string $fakultas = null): float
    {
        $bindings = [];
        $yearIn = $this->buildInClause($years, $bindings);
        $fakFilter = '';
        if ($fakultas) {
            $fakFilter = " AND EXISTS (
                SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
                WHERE sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
                    AND s.id_fak_unila = ?
            )";
            $bindings[] = self::UNILA_ID_SP;
            $bindings[] = $fakultas;
        }

        $sql = "
            SELECT ISNULL(SUM(
                ISNULL(CAST(l.dana_dikti AS FLOAT), 0) +
                ISNULL(CAST(l.dana_pt AS FLOAT), 0) +
                ISNULL(CAST(l.dana_institusi_lain AS FLOAT), 0)
            ), 0)
            FROM pdrd.litabmas l
            WHERE l.soft_delete = 0
              AND l.id_thn_kegiatan IN {$yearIn}
              {$fakFilter}
        ";

        return (float) $this->selectScalar($sql, $bindings);
    }

    /**
     * Pendapatan Non-Mhs: Kerjasama (besaran_kerjasama)
     * Filter: MoU overlap tahun, besaran > 0
     */
    public function getKerjasamaRevenue(array $years, ?string $fakultas = null): float
    {
        $bindings = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings);
        $fakFilter = $this->buildFakultasFilter($fakultas, $bindings, 'sms');

        $sql = "
            SELECT ISNULL(SUM(CAST(sk.besaran_kerjasama AS FLOAT)), 0)
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m
                ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms
                ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
                AND ({$mouYear})
                AND sk.besaran_kerjasama IS NOT NULL
                AND CAST(sk.besaran_kerjasama AS FLOAT) > 0
                {$fakFilter}
        ";

        return (float) $this->selectScalar($sql, $bindings);
    }

    /**
     * Pendapatan Non-Mhs: Biaya operasional yang bersifat pemasukan
     * JOIN ref.jenis_keuangan WHERE a_pemasukan = 1
     * Bisa return 0 jika data kosong
     */
    public function getBiayaOperasionalPemasukan(array $years, ?string $fakultas = null): float
    {
        $bindings = [];
        $yearIn = $this->buildInClause($years, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(bo.total_biaya AS FLOAT)), 0)
            FROM keuangan.biaya_operasional bo
            INNER JOIN ref.jenis_keuangan jk
                ON bo.id_jns_keuangan = jk.id_jns_keuangan
            WHERE jk.a_pemasukan = 1
              AND bo.id_tahun_anggaran IN {$yearIn}
        ";

        return (float) $this->selectScalar($sql, $bindings);
    }

    /**
     * Hitung IKU 9 keseluruhan
     */
    public function calculateIKU9(array $years, ?string $fakultas = null): array
    {
        $ukt = $this->getUKTRevenue($years);
        $litabmas = $this->getLitabmasRevenue($years, $fakultas);
        $kerjasama = $this->getKerjasamaRevenue($years, $fakultas);
        $boPemasukan = $this->getBiayaOperasionalPemasukan($years, $fakultas);

        $nonMahasiswa = $litabmas + $kerjasama + $boPemasukan;
        $total = $ukt + $nonMahasiswa;
        $persentase = $total > 0 ? round(($nonMahasiswa / $total) * 100, 2) : 0;

        return [
            'persentase' => $persentase,
            'pendapatan_mahasiswa' => $ukt,
            'pendapatan_non_mahasiswa' => $nonMahasiswa,
            'total_pendapatan' => $total,
            'detail_litabmas' => $litabmas,
            'detail_kerjasama' => $kerjasama,
            'detail_operasional' => $boPemasukan,
        ];
    }

    /**
     * Breakdown pendapatan per kategori (untuk pie/donut chart)
     */
    public function getRevenueBreakdown(array $years, ?string $fakultas = null): array
    {
        $ukt = $this->getUKTRevenue($years);
        $litabmas = $this->getLitabmasRevenue($years, $fakultas);
        $kerjasama = $this->getKerjasamaRevenue($years, $fakultas);
        $boPemasukan = $this->getBiayaOperasionalPemasukan($years, $fakultas);

        $breakdown = [
            ['name' => 'UKT/SPP (Mahasiswa)', 'value' => $ukt],
            ['name' => 'Dana Riset (Litabmas)', 'value' => $litabmas],
            ['name' => 'Kerjasama', 'value' => $kerjasama],
        ];

        if ($boPemasukan > 0) {
            $breakdown[] = ['name' => 'Operasional (Pemasukan)', 'value' => $boPemasukan];
        }

        return $breakdown;
    }

    /**
     * Trend IKU 9: 5 tahun terakhir
     */
    public function getTrendIKU9(int $currentYear): array
    {
        $trend = [];
        $startYear = $currentYear - 4;

        for ($yr = $startYear; $yr <= $currentYear; $yr++) {
            $data = $this->calculateIKU9([$yr]);

            $trend[] = [
                'name' => (string) $yr,
                'value' => $data['persentase'],
            ];
        }

        return $trend;
    }

    /**
     * Drilldown IKU 9: per fakultas
     * UKT per fak + litabmas per fak + kerjasama per fak → rasio
     */
    public function getIKU9PerFakultas(array $years): array
    {
        $bindings = [];

        // UKT per fakultas
        $yearInUkt = $this->buildInClause($years, $bindings);

        $sqlUkt = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_fak_unila) AS id_fak,
                ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0) AS ukt
            FROM keuangan.spp_mhs sm
            INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sm.soft_delete = 0
              AND LEFT(CAST(sm.id_smt AS VARCHAR), 4) IN {$yearInUkt}
            GROUP BY sms.id_fak_unila
        ";
        $uktRows = $this->select($sqlUkt, $bindings);
        $uktMap = [];
        foreach ($uktRows as $row) {
            $uktMap[$row->id_fak] = (float) $row->ukt;
        }

        // Litabmas revenue per fakultas
        $bindings2 = [];
        $bindings2[] = self::UNILA_ID_SP;
        $yearInLit = $this->buildInClause($years, $bindings2);

        $sqlLit = "
            SELECT
                CONVERT(VARCHAR(36), s.id_fak_unila) AS id_fak,
                ISNULL(SUM(
                    ISNULL(CAST(l.dana_dikti AS FLOAT), 0) +
                    ISNULL(CAST(l.dana_pt AS FLOAT), 0) +
                    ISNULL(CAST(l.dana_institusi_lain AS FLOAT), 0)
                ), 0) AS dana
            FROM pdrd.litabmas l
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE l.soft_delete = 0
              AND l.id_thn_kegiatan IN {$yearInLit}
            GROUP BY s.id_fak_unila
        ";
        $litRows = $this->select($sqlLit, $bindings2);
        $litMap = [];
        foreach ($litRows as $row) {
            $litMap[$row->id_fak] = (float) $row->dana;
        }

        // Kerjasama revenue per fakultas
        $bindings3 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings3);

        $sqlKerja = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_fak_unila) AS id_fak,
                ISNULL(SUM(CAST(sk.besaran_kerjasama AS FLOAT)), 0) AS dana
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
                AND ({$mouYear})
                AND sk.besaran_kerjasama IS NOT NULL
                AND CAST(sk.besaran_kerjasama AS FLOAT) > 0
            GROUP BY sms.id_fak_unila
        ";
        $kerjaRows = $this->select($sqlKerja, $bindings3);
        $kerjaMap = [];
        foreach ($kerjaRows as $row) {
            $kerjaMap[$row->id_fak] = (float) $row->dana;
        }

        // Get fakultas list
        $sqlFak = "
            SELECT CONVERT(VARCHAR(36), id_sms) AS id, nm_lemb AS name
            FROM pdrd.sms
            WHERE soft_delete = 0 AND id_jenj_didik IS NULL AND stat_prodi = 'A'
                AND id_sms IN (
                    SELECT DISTINCT id_fak_unila FROM pdrd.sms
                    WHERE soft_delete = 0 AND stat_prodi = 'A' AND id_fak_unila IS NOT NULL
                )
            ORDER BY nm_lemb
        ";
        $fakRows = $this->select($sqlFak);

        $result = [];
        foreach ($fakRows as $fak) {
            $ukt = $uktMap[$fak->id] ?? 0;
            $lit = $litMap[$fak->id] ?? 0;
            $kerja = $kerjaMap[$fak->id] ?? 0;
            $nonMhs = $lit + $kerja;
            $total = $ukt + $nonMhs;
            $value = $total > 0 ? round(($nonMhs / $total) * 100, 1) : 0;

            $result[] = [
                'id' => $fak->id,
                'name' => $fak->name,
                'value' => $value,
            ];
        }

        return $result;
    }

    /**
     * Drilldown IKU 9: per prodi dalam satu fakultas
     */
    public function getIKU9PerProdi(array $years, string $idFakultas): array
    {
        $bindings = [];

        // UKT per prodi
        $yearInUkt = $this->buildInClause($years, $bindings);
        $bindings[] = $idFakultas;

        $sqlUkt = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_sms) AS id_sms,
                ISNULL(SUM(CAST(sm.nominal AS FLOAT)), 0) AS ukt
            FROM keuangan.spp_mhs sm
            INNER JOIN pdrd.reg_pd rp ON sm.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sm.soft_delete = 0
              AND LEFT(CAST(sm.id_smt AS VARCHAR), 4) IN {$yearInUkt}
              AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms
        ";
        $uktRows = $this->select($sqlUkt, $bindings);
        $uktMap = [];
        foreach ($uktRows as $row) {
            $uktMap[$row->id_sms] = (float) $row->ukt;
        }

        // Litabmas per prodi
        $bindings2 = [];
        $bindings2[] = self::UNILA_ID_SP;
        $yearInLit = $this->buildInClause($years, $bindings2);
        $bindings2[] = $idFakultas;

        $sqlLit = "
            SELECT
                CONVERT(VARCHAR(36), ptk.id_sms) AS id_sms,
                ISNULL(SUM(
                    ISNULL(CAST(l.dana_dikti AS FLOAT), 0) +
                    ISNULL(CAST(l.dana_pt AS FLOAT), 0) +
                    ISNULL(CAST(l.dana_institusi_lain AS FLOAT), 0)
                ), 0) AS dana
            FROM pdrd.litabmas l
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sal.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE l.soft_delete = 0
              AND l.id_thn_kegiatan IN {$yearInLit}
              AND s.id_fak_unila = ?
            GROUP BY ptk.id_sms
        ";
        $litRows = $this->select($sqlLit, $bindings2);
        $litMap = [];
        foreach ($litRows as $row) {
            $litMap[$row->id_sms] = (float) $row->dana;
        }

        // Kerjasama per prodi
        $bindings3 = [];
        $mouYear = $this->buildMouYearOverlap($years, $bindings3);
        $bindings3[] = $idFakultas;

        $sqlKerja = "
            SELECT
                CONVERT(VARCHAR(36), sms.id_sms) AS id_sms,
                ISNULL(SUM(CAST(sk.besaran_kerjasama AS FLOAT)), 0) AS dana
            FROM kerjasama.sms_kerjasama sk
            INNER JOIN kerjasama.mou m ON m.id_mou = sk.id_mou AND m.soft_delete = 0
            INNER JOIN pdrd.sms sms ON sms.id_sms = sk.id_sms AND sms.soft_delete = 0 AND sms.stat_prodi = 'A'
            WHERE sk.soft_delete = 0
                AND ({$mouYear})
                AND sk.besaran_kerjasama IS NOT NULL
                AND CAST(sk.besaran_kerjasama AS FLOAT) > 0
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms
        ";
        $kerjaRows = $this->select($sqlKerja, $bindings3);
        $kerjaMap = [];
        foreach ($kerjaRows as $row) {
            $kerjaMap[$row->id_sms] = (float) $row->dana;
        }

        // Get prodi list
        $sqlProdi = "
            SELECT CONVERT(VARCHAR(36), id_sms) AS id, nm_lemb AS name
            FROM pdrd.sms
            WHERE soft_delete = 0 AND stat_prodi = 'A' AND id_fak_unila = ?
            ORDER BY nm_lemb
        ";
        $prodiRows = $this->select($sqlProdi, [$idFakultas]);

        $result = [];
        foreach ($prodiRows as $prodi) {
            $ukt = $uktMap[$prodi->id] ?? 0;
            $lit = $litMap[$prodi->id] ?? 0;
            $kerja = $kerjaMap[$prodi->id] ?? 0;
            $nonMhs = $lit + $kerja;
            $total = $ukt + $nonMhs;
            $value = $total > 0 ? round(($nonMhs / $total) * 100, 1) : 0;

            $result[] = [
                'id' => $prodi->id,
                'name' => $prodi->name,
                'value' => $value,
            ];
        }

        return $result;
    }
}
