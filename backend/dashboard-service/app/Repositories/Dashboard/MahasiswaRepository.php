<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class MahasiswaRepository extends BaseRepository
{
    // =========================================
    // STAT CARDS
    // =========================================

    /**
     * Count mahasiswa aktif — konsisten dengan infografis public:
     * mahasiswa yang tercatat di kuliah_mhs semester terpilih dengan id_stat_mhs='A'.
     * Definisi ini match infografis /mahasiswa-statistics + SIMBAK.
     */
    public function countAktif(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL match headline 37.181: realtime reg_pd open + pd.id_stat_mhs='A'.
        // TIDAK depend semester filter (jumlah mahasiswa aktif = real-time, BUKAN snapshot semester).
        // Sebelumnya snapshot kuliah_mhs ~34.054 (missing 3.127 reg yg belum sync ke kuliah_mhs).
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count mahasiswa baru (masuk pada semester tertentu)
     */
    public function countBaru(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($semesters, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND CAST(rp.id_semester_masuk AS VARCHAR(5)) IN {$inClause}
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count lulusan pada semester tertentu (id_jns_keluar = 1)
     */
    public function countLulus(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $years = $this->extractYears($semesters);
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count mahasiswa cuti — dari kuliah_mhs.id_stat_mhs='C' pada semester terpilih.
     * Konsisten dengan public-service.
     */
    public function countCuti(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL match Beranda countMahasiswaCuti: latest semester per reg_pd, status='C'.
        // Tidak filter berdasarkan $semesters (Cuti = realtime status terbaru, bukan per semester).
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT km.id_reg_pd)
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
                AND rp.id_sp = ? AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE km.soft_delete = 0
              AND km.id_stat_mhs = 'C'
              AND km.id_smt = (
                  SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                  WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
              )
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count mahasiswa DO (Drop Out) pada semester tertentu
     */
    public function countDO(array $semesters, ?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $years = $this->extractYears($semesters);
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) IN ('4', '6')
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // TREND (5 TAHUN)
    // =========================================

    /**
     * Trend jumlah mahasiswa aktif 5 tahun terakhir
     */
    public function getTrend(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;

        // Bindings: startYear, maxYear for CTE, then UNILA_ID_SP + optional location for subquery
        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                (
                    SELECT COUNT(rp.id_reg_pd)
                    FROM pdrd.reg_pd rp
                    INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
                    WHERE rp.id_sp = ?
                      AND rp.soft_delete = 0
                      AND s.soft_delete = 0
                      AND rp.id_jns_keluar IS NULL
                      AND CAST(LEFT(rp.id_semester_masuk, 4) AS INT) <= y.yr
                      {$fakFilter}
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // SEBARAN FAKULTAS (DRILLDOWN)
    // =========================================

    /**
     * Sebaran mahasiswa aktif per fakultas
     */
    public function getSebaranFakultas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL match countAktif/headline 37.181: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id,
                uo.nm_lemb as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Sebaran mahasiswa aktif per prodi dalam satu fakultas (children drilldown).
     * Kalau $prodiNarrow ada, hasil di-filter ke prodi tsb saja.
     */
    public function getSebaranProdi(string $idFakultas, array $semesters, ?string $prodiNarrow = null): array
    {
        // CANONICAL: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP, $idFakultas];
        $prodiClause = '';
        if ($prodiNarrow) {
            $prodiClause = ' AND s.id_sms = ?';
            $bindings[] = $prodiNarrow;
        }

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id,
                s.nm_lemb as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.id_fak_unila = ?
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$prodiClause}
            GROUP BY s.id_sms, s.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // DISTRIBUSI
    // =========================================

    /**
     * Distribusi jenjang pendidikan (S1, D3, S2, S3, Profesi)
     */
    public function getDistribusiJenjang(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                jp.nm_jenj_didik as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY jp.nm_jenj_didik
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Distribusi jalur masuk (SNBP, SNBT, Mandiri, dll)
     */
    public function getJalurMasuk(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($semesters, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(jd.nm_jalur_daftar, 'Tidak Diketahui') as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            LEFT JOIN ref.jalur_daftar jd ON rp.id_jalur_daftar = jd.id_jalur_daftar
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND CAST(rp.id_semester_masuk AS VARCHAR(5)) IN {$inClause}
              {$fakFilter}
            GROUP BY jd.nm_jalur_daftar
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Distribusi pembiayaan (UKT Reguler, KIP, Beasiswa, dll)
     */
    public function getPembiayaan(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                ISNULL(bp.nm_pembiayaan, 'Tidak Diketahui') as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.pembiayaan bp ON rp.id_pembiayaan = bp.id_pembiayaan
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY bp.nm_pembiayaan
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // IPK
    // =========================================

    /**
     * Distribusi IPK mahasiswa aktif (ranges).
     * Source: kuliah_mhs.ipk per-semester (reg_pd.ipk SELALU NULL di pdut).
     * OUTER APPLY latest semester per mhs supaya IPK kumulatif terkini.
     */
    public function getDistribusiIPK(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN ipk_now.ipk >= 3.51 THEN '3.51 - 4.00'
                    WHEN ipk_now.ipk >= 3.01 THEN '3.01 - 3.50'
                    WHEN ipk_now.ipk >= 2.51 THEN '2.51 - 3.00'
                    WHEN ipk_now.ipk >= 2.01 THEN '2.01 - 2.50'
                    ELSE '< 2.00'
                END as name,
                COUNT(*) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            OUTER APPLY (
                SELECT TOP 1 kmh.ipk
                FROM pdrd.kuliah_mhs kmh
                WHERE kmh.id_reg_pd = rp.id_reg_pd
                  AND kmh.soft_delete = 0
                  AND kmh.ipk > 0
                ORDER BY kmh.id_smt DESC
            ) ipk_now
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              AND ipk_now.ipk IS NOT NULL
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN ipk_now.ipk >= 3.51 THEN '3.51 - 4.00'
                    WHEN ipk_now.ipk >= 3.01 THEN '3.01 - 3.50'
                    WHEN ipk_now.ipk >= 2.51 THEN '2.51 - 3.00'
                    WHEN ipk_now.ipk >= 2.01 THEN '2.01 - 2.50'
                    ELSE '< 2.00'
                END
            ORDER BY name DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Rata-rata IPK per fakultas — pakai kuliah_mhs latest semester.
     */
    public function getIPKPerFakultas(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                ROUND(AVG(ipk_now.ipk), 2) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            OUTER APPLY (
                SELECT TOP 1 kmh.ipk
                FROM pdrd.kuliah_mhs kmh
                WHERE kmh.id_reg_pd = rp.id_reg_pd
                  AND kmh.soft_delete = 0
                  AND kmh.ipk > 0
                ORDER BY kmh.id_smt DESC
            ) ipk_now
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              AND ipk_now.ipk IS NOT NULL
              {$fakFilter}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Distribusi masa studi lulusan
     */
    public function getMasaStudi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $years = $this->extractYears($semesters);
        $inClause = $this->buildInClause($years, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) < 48 THEN '< 4 Tahun'
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) <= 54 THEN '4 Tahun'
                    ELSE '> 4 Tahun'
                END as name,
                COUNT(*) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              AND rp.tgl_masuk_sp IS NOT NULL
              AND rp.tgl_keluar IS NOT NULL
              AND YEAR(rp.tgl_keluar) IN {$inClause}
              {$fakFilter}
            GROUP BY
                CASE
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) < 48 THEN '< 4 Tahun'
                    WHEN DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) <= 54 THEN '4 Tahun'
                    ELSE '> 4 Tahun'
                END
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // BEASISWA
    // =========================================

    /**
     * Distribusi penerima beasiswa aktif.
     * Source: ref.pembiayaan via reg_pd.id_pembiayaan (Mandiri/Beasiswa Penuh/Bidikmisi/dll).
     * Sebelumnya pakai pd.a_terima_kps/a_bidikmisi/a_pmpap/a_bebas_biaya — schema ada tapi
     * SEMUA flag=0 di pdut → empty chart. id_pembiayaan terpopulasi 37.181 mhs aktif.
     */
    public function getBeasiswa(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                COALESCE(pm.nm_pembiayaan, 'Tidak Tercatat') AS name,
                COUNT(*) AS value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.pembiayaan pm ON pm.id_pembiayaan = rp.id_pembiayaan
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY pm.nm_pembiayaan
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TUGAS AKHIR
    // =========================================

    /**
     * Mahasiswa sedang tugas akhir per fakultas.
     * Source: kuliah_mhs.id_stat_mhs='U' (Menunggu Ujian) di semester aktif.
     * Sebelumnya pakai reg_pd.bln_awal_bimbingan — ALL NULL di pdut → empty chart.
     * Status 'U' = mhs sedang menempuh skripsi/tesis menunggu jadwal ujian.
     */
    public function getTugasAkhir(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                uo.nm_lemb AS name,
                COUNT(DISTINCT kmh.id_reg_pd) AS value
            FROM pdrd.kuliah_mhs kmh
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = kmh.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE kmh.soft_delete = 0
              AND kmh.id_stat_mhs = 'U'
              AND kmh.id_smt = (
                  SELECT TOP 1 id_smt FROM ref.semester
                  WHERE a_periode_aktif = 1 AND expired_date IS NULL
                  ORDER BY id_smt DESC
              )
              AND rp.id_sp = ?
              AND rp.id_jns_keluar IS NULL
              {$fakFilter}
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // GEOGRAFIS
    // =========================================

    /**
     * Top 5 asal provinsi mahasiswa
     */
    public function getAsalProvinsi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT TOP 5
                ISNULL(w.nm_wil, 'Tidak Diketahui') as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.wilayah w ON LEFT(pd.id_wil, 2) = LEFT(w.id_wil, 2)
                AND w.id_level_wil = 1
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY w.nm_wil
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    /**
     * Mahasiswa asing per negara
     */
    public function getMahasiswaAsing(array $semesters): array
    {
        $sql = "
            SELECT TOP 5
                ISNULL(n.nm_negara, 'Tidak Diketahui') as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.negara n ON pd.id_kewarganegaraan = n.id_negara
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              AND pd.id_kewarganegaraan != 'ID'
              AND pd.id_kewarganegaraan IS NOT NULL
            GROUP BY n.nm_negara
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // WARNING: MASA STUDI MAKSIMAL
    // =========================================

    /**
     * Mahasiswa yang mendekati/melebihi batas masa studi
     */
    public function getWarningMasaStudi(): array
    {
        $sql = "
            SELECT
                CASE
                    WHEN jp.nm_jenj_didik LIKE '%S1%' OR jp.nm_jenj_didik LIKE '%Sarjana%'
                        THEN 'S1 (> 12 Semester)'
                    WHEN jp.nm_jenj_didik LIKE '%D3%' OR jp.nm_jenj_didik LIKE '%Diploma%'
                        THEN 'D3 (> 8 Semester)'
                    WHEN jp.nm_jenj_didik LIKE '%S2%' OR jp.nm_jenj_didik LIKE '%Magister%'
                        THEN 'S2 (> 6 Semester)'
                    ELSE 'Lainnya'
                END as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
            INNER JOIN ref.jenjang_pendidikan jp ON s.id_jenj_didik = jp.id_jenj_didik
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND s.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND (
                  -- S1: > 12 semester (6 tahun)
                  ((jp.nm_jenj_didik LIKE '%S1%' OR jp.nm_jenj_didik LIKE '%Sarjana%')
                    AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) > 72)
                  OR
                  -- D3: > 8 semester (4 tahun)
                  ((jp.nm_jenj_didik LIKE '%D3%' OR jp.nm_jenj_didik LIKE '%Diploma%')
                    AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) > 48)
                  OR
                  -- S2: > 6 semester (3 tahun)
                  ((jp.nm_jenj_didik LIKE '%S2%' OR jp.nm_jenj_didik LIKE '%Magister%')
                    AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) > 36)
              )
              AND rp.tgl_masuk_sp IS NOT NULL
            GROUP BY
                CASE
                    WHEN jp.nm_jenj_didik LIKE '%S1%' OR jp.nm_jenj_didik LIKE '%Sarjana%'
                        THEN 'S1 (> 12 Semester)'
                    WHEN jp.nm_jenj_didik LIKE '%D3%' OR jp.nm_jenj_didik LIKE '%Diploma%'
                        THEN 'D3 (> 8 Semester)'
                    WHEN jp.nm_jenj_didik LIKE '%S2%' OR jp.nm_jenj_didik LIKE '%Magister%'
                        THEN 'S2 (> 6 Semester)'
                    ELSE 'Lainnya'
                END
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // GENDER DISTRIBUSI
    // =========================================

    /**
     * Distribusi gender mahasiswa aktif
     */
    public function getGenderDistribusi(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL: realtime reg_pd + pd.id_stat_mhs='A'.
        $bindings = [self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                CASE WHEN pd.jk = 'L' THEN 'Laki-laki' ELSE 'Perempuan' END as name,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            WHERE rp.id_sp = ?
              AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$fakFilter}
            GROUP BY pd.jk
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // STATUS MAHASISWA
    // =========================================

    /**
     * Status mahasiswa dari kuliah_mhs
     */
    public function getStatusMahasiswa(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $bindings = [self::UNILA_ID_SP];
        $inClause = $this->buildInClause($semesters, $bindings);
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT
                sm.nm_stat_mhs as name,
                COUNT(DISTINCT km.id_reg_pd) as value
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON km.id_reg_pd = rp.id_reg_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN ref.status_mahasiswa sm ON km.id_stat_mhs = sm.id_stat_mhs
            WHERE km.soft_delete = 0
              AND rp.id_sp = ?
              AND CAST(km.id_smt AS VARCHAR(5)) IN {$inClause}
              {$fakFilter}
            GROUP BY sm.nm_stat_mhs
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // TREND MAHASISWA BARU (5 TAHUN)
    // =========================================

    /**
     * Trend mahasiswa baru 5 tahun terakhir
     */
    public function getTrendMahasiswaBaru(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        $maxYear = (int) $this->getMaxYear($semesters);
        $startYear = $maxYear - 4;

        $bindings = [$startYear, $maxYear, self::UNILA_ID_SP];
        $fakFilter = $this->buildLocationFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH years AS (
                SELECT ? AS yr
                UNION ALL SELECT yr + 1 FROM years WHERE yr < ?
            )
            SELECT
                CAST(y.yr AS VARCHAR) as name,
                (
                    SELECT COUNT(rp.id_reg_pd)
                    FROM pdrd.reg_pd rp
                    INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms
                    WHERE rp.id_sp = ?
                      AND rp.soft_delete = 0
                      AND s.soft_delete = 0
                      AND CAST(LEFT(rp.id_semester_masuk, 4) AS INT) = y.yr
                      {$fakFilter}
                ) as value
            FROM years y
            ORDER BY y.yr
        ";

        return $this->select($sql, $bindings);
    }

    // =========================================
    // RASIO DOSEN : MAHASISWA
    // =========================================

    /**
     * Rasio dosen terhadap mahasiswa per fakultas
     */
    public function getRasioDosenMahasiswa(array $semesters): array
    {
        $maxYear = $this->getMaxYear($semesters);

        $sql = "
            SELECT
                uo.nm_lemb as name,
                CASE
                    WHEN ISNULL(dosen_cnt.cnt, 0) = 0 THEN 0
                    ELSE ROUND(CAST(mhs_cnt.cnt AS FLOAT) / dosen_cnt.cnt, 1)
                END as value
            FROM man_akses.unit_organisasi uo
            LEFT JOIN (
                SELECT s.id_fak_unila, COUNT(rp.id_reg_pd) as cnt
                FROM pdrd.reg_pd rp
                INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
                WHERE rp.id_sp = ? AND rp.soft_delete = 0
                  AND rp.id_jns_keluar IS NULL
                  AND CAST(LEFT(rp.id_semester_masuk, 4) AS INT) <= CAST(? AS INT)
                GROUP BY s.id_fak_unila
            ) mhs_cnt ON mhs_cnt.id_fak_unila = uo.id_organisasi
            LEFT JOIN (
                SELECT s2.id_fak_unila, COUNT(DISTINCT sdm2.id_sdm) as cnt
                FROM pdrd.sdm sdm2
                INNER JOIN pdrd.reg_ptk ptk2 ON ptk2.id_sdm = sdm2.id_sdm AND ptk2.soft_delete = 0
                INNER JOIN pdrd.sms s2 ON ptk2.id_sms = s2.id_sms AND s2.soft_delete = 0
                WHERE sdm2.soft_delete = 0
                  AND sdm2.id_jns_sdm = 12
                  AND sdm2.id_stat_aktif = 1
                  AND ptk2.id_jns_keluar IS NULL
                  AND CAST(ptk2.id_sp AS VARCHAR(50)) = ?
                GROUP BY s2.id_fak_unila
            ) dosen_cnt ON dosen_cnt.id_fak_unila = uo.id_organisasi
            WHERE uo.soft_delete = 0
              AND mhs_cnt.cnt IS NOT NULL
              AND mhs_cnt.cnt > 0
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP, $maxYear, self::UNILA_ID_SP]);
    }
}
