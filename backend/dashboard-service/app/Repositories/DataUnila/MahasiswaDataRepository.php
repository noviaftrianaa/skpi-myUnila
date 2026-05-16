<?php

namespace App\Repositories\DataUnila;

/**
 * Mahasiswa Raw Data Repository
 * Server-side paginated, searchable, sortable raw data queries
 */
class MahasiswaDataRepository extends BaseDataRepository
{
    private const BASE_SELECT = "
        SELECT
            CONVERT(VARCHAR(36), pd.id_pd) as id_pd,
            pd.nm_pd,
            pd.jk,
            pd.nik,
            pd.nisn,
            pd.tmpt_lahir,
            CONVERT(VARCHAR(10), pd.tgl_lahir, 120) as tgl_lahir,
            CONVERT(VARCHAR(36), rp.id_reg_pd) as id_reg_pd,
            rp.nipd,
            CAST(rp.id_semester_masuk AS VARCHAR(5)) as id_semester_masuk,
            LEFT(rp.id_semester_masuk, 4) as angkatan,
            CONVERT(VARCHAR(36), rp.id_sms) as id_sms,
            s.nm_lemb as nm_prodi,
            s.id_jenj_didik as jenjang,
            fak.nm_lemb as nm_fakultas,
            CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
            jd.nm_jalur_daftar as jalur_masuk,
            sem.semester,
            ipk_latest.ipk,
            CONVERT(VARCHAR(36), s.id_jur_unila) as id_jurusan,
            jur.nm_lemb as nm_jurusan,
            -- Status di-render dgn prioritas: Aktif (NULL & tdk cuti) > Cuti (km.id_stat_mhs='C' latest)
            -- > ket_keluar dari ref.jenis_keluar (LOOKUP — bukan hardcoded mapping).
            CASE
                WHEN rp.id_jns_keluar IS NULL AND km_latest.is_cuti = 1 THEN 'Cuti'
                WHEN rp.id_jns_keluar IS NULL THEN 'Aktif'
                ELSE ISNULL(jk.ket_keluar, 'Lainnya')
            END as status,
            CAST(rp.id_jns_keluar AS VARCHAR(2)) as id_jns_keluar,
            CONVERT(VARCHAR(10), rp.tgl_keluar, 120) as tgl_keluar,
            ref_ag.nm_agama,
            pd.email,
            pd.tlpn_hp
        FROM pdrd.peserta_didik pd
        OUTER APPLY (
            SELECT TOP 1 *
            FROM pdrd.reg_pd rp2
            WHERE rp2.id_pd = pd.id_pd AND rp2.soft_delete = 0
              AND rp2.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY
                CASE WHEN rp2.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                rp2.tgl_masuk_sp DESC, rp2.create_date DESC
        ) rp
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN pdrd.sms jur ON jur.id_sms = s.id_jur_unila AND jur.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
        LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = pd.id_agama
        LEFT JOIN ref.jalur_daftar jd ON jd.id_jalur_daftar = rp.id_jalur_daftar
        LEFT JOIN ref.jenis_keluar jk ON jk.id_jns_keluar = rp.id_jns_keluar AND jk.expired_date IS NULL
        OUTER APPLY (
            SELECT COUNT(DISTINCT km.id_smt) AS semester
            FROM pdrd.kuliah_mhs km
            WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
        ) sem
        OUTER APPLY (
            SELECT TOP 1 CAST(km.ipk AS DECIMAL(4,2)) AS ipk
            FROM pdrd.kuliah_mhs km
            WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
              AND km.ipk IS NOT NULL AND km.ipk > 0
            ORDER BY km.id_smt DESC
        ) ipk_latest
        OUTER APPLY (
            SELECT TOP 1 CASE WHEN km.id_stat_mhs = 'C' THEN 1 ELSE 0 END AS is_cuti
            FROM pdrd.kuliah_mhs km
            WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
            ORDER BY km.id_smt DESC
        ) km_latest
        WHERE pd.soft_delete = 0
          AND rp.id_reg_pd IS NOT NULL
          {WHERE_EXTRA}
    ";

    private const BASE_COUNT = "
        SELECT COUNT(DISTINCT pd.id_pd)
        FROM pdrd.peserta_didik pd
        OUTER APPLY (
            SELECT TOP 1 *
            FROM pdrd.reg_pd rp2
            WHERE rp2.id_pd = pd.id_pd AND rp2.soft_delete = 0
              AND rp2.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY
                CASE WHEN rp2.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                rp2.tgl_masuk_sp DESC, rp2.create_date DESC
        ) rp
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        WHERE pd.soft_delete = 0
          AND rp.id_reg_pd IS NOT NULL
          {WHERE_EXTRA}
    ";

    private const SEARCH_COLS = ['pd.nm_pd', 'rp.nipd', 'pd.nik', 'pd.nisn', 'pd.email'];
    private const SORTABLE_COLS = [
        'nm_pd', 'nipd', 'angkatan', 'nm_prodi', 'nm_fakultas', 'nm_jurusan',
        'jalur_masuk', 'semester', 'ipk', 'status', 'id_semester_masuk',
    ];

    /**
     * Get paginated mahasiswa list with filters
     */
    public function getList(array $params): array
    {
        return $this->paginate(
            self::BASE_SELECT,
            self::BASE_COUNT,
            $params,
            self::SEARCH_COLS,
            self::SORTABLE_COLS,
            'nm_pd',
            'ASC'
        );
    }

    /**
     * Get mahasiswa detail by id_pd
     */
    public function getDetail(string $idPd): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), pd.id_pd) as id_pd,
                pd.nm_pd, pd.jk, pd.nik, pd.nisn,
                pd.tmpt_lahir,
                CONVERT(VARCHAR(10), pd.tgl_lahir, 120) as tgl_lahir,
                pd.jln, pd.rt, pd.rw, pd.nm_dsn, pd.ds_kel, pd.kode_pos,
                pd.email, pd.tlpn_hp,
                pd.nm_ayah, pd.nm_ibu_kandung AS nm_ibu,
                CONVERT(VARCHAR(36), rp.id_reg_pd) as id_reg_pd,
                rp.nipd,
                CAST(rp.id_semester_masuk AS VARCHAR(5)) as id_semester_masuk,
                LEFT(rp.id_semester_masuk, 4) as angkatan,
                s.nm_lemb as nm_prodi,
                s.id_jenj_didik as jenjang,
                fak.nm_lemb as nm_fakultas,
                CASE
                    WHEN rp.id_jns_keluar IS NULL THEN 'Aktif'
                    WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '1' THEN 'Lulus'
                    WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 'Mutasi'
                    WHEN CAST(rp.id_jns_keluar AS VARCHAR) IN ('3','5') THEN 'DO'
                    ELSE 'Lainnya'
                END as status,
                CONVERT(VARCHAR(10), rp.tgl_keluar, 120) as tgl_keluar,
                rp.ipk,
                ref_ag.nm_agama,
                w.nm_wil as nm_wilayah
            FROM pdrd.peserta_didik pd
            INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = pd.id_agama
            LEFT JOIN ref.wilayah w ON w.id_wil = pd.id_wil
            WHERE pd.soft_delete = 0
              AND pd.id_pd = ?
            ORDER BY rp.id_semester_masuk DESC
        ";
        return $this->selectOne($sql, [$idPd]);
    }

    /**
     * Get FULL profile dari PDDikti (single source of truth — TIDAK pakai schema siakadu).
     * Mengikuti pattern myunila-service GetMahasiswaByNIM().
     */
    public function getFullProfile(string $idPd): array
    {
        // 1) Resolve NIM from id_pd (PDDikti)
        $resolve = $this->selectOne("
            SELECT TOP 1
                rp.nipd AS nim,
                CONVERT(VARCHAR(36), rp.id_reg_pd) AS id_reg_pd,
                CONVERT(VARCHAR(36), rp.id_pd) AS id_pd
            FROM pdrd.reg_pd rp
            WHERE rp.id_pd = ? AND rp.soft_delete = 0
            ORDER BY rp.id_semester_masuk DESC
        ", [$idPd]);

        if (!$resolve) return ['siakadu' => null, 'pddikti' => null, 'keluarga' => [], 'riwayat_semester' => []];

        $nim = $resolve->nim;
        $idRegPd = $resolve->id_reg_pd;

        // 2) SIAKADU profile DIHAPUS — no longer read from siakadu schema.
        //    Semua data identitas/akademik/keluarga di-derive dari pdrd (PDDikti).
        $siakadu = null;

        // 3) PDDikti profile — single source of truth (semua dari pdrd schema)
        //    Enriched dgn IPK dari latest kuliah_mhs (sebab rp.ipk seringkali NULL)
        $pddikti = $this->selectOne("
            SELECT
                rp.nipd AS nim,
                pd.nm_pd AS nama,
                pd.jk,
                pd.tmpt_lahir,
                CONVERT(VARCHAR(10), pd.tgl_lahir, 120) AS tgl_lahir,
                pd.nik, pd.nisn, pd.email,
                pd.tlpn_hp AS hp, pd.tlpn_rumah AS telepon,
                pd.jln AS alamat, pd.rt, pd.rw, pd.nm_dsn AS dusun,
                pd.ds_kel AS desa_kelurahan, pd.kode_pos,
                pd.id_kk AS nokk,
                pd.nm_ayah, pd.nm_ibu_kandung AS nm_ibu, pd.nm_wali,
                CONVERT(VARCHAR(10), pd.tgl_lahir_ayah, 120) AS tgl_lahir_ayah,
                CONVERT(VARCHAR(10), pd.tgl_lahir_ibu, 120) AS tgl_lahir_ibu,
                pd.nik_ayah, pd.nik_ibu,
                ag.nm_agama AS nama_agama,
                w.nm_wil AS nama_wilayah,
                s.nm_lemb AS nm_prodi,
                jur.nm_lemb AS nm_jurusan,
                fak.nm_lemb AS nm_fakultas,
                CAST(rp.id_semester_masuk AS VARCHAR(5)) AS semester_masuk,
                LEFT(rp.id_semester_masuk, 4) AS angkatan,
                jd.nm_jalur_daftar AS jalur_masuk,
                jp.nm_jns_daftar AS jenis_pendaftaran,
                COALESCE(ipk_latest.ipk, CAST(rp.ipk AS DECIMAL(4,2))) AS ipk,
                sks_total.total_sks AS sks_total,
                sem.semester,
                CASE
                    WHEN rp.id_jns_keluar IS NULL AND km_latest.is_cuti = 1 THEN 'Cuti'
                    WHEN rp.id_jns_keluar IS NULL THEN 'Aktif'
                    ELSE ISNULL(jk.ket_keluar, 'Lainnya')
                END AS status,
                CONVERT(VARCHAR(10), rp.tgl_keluar, 120) AS tgl_keluar,
                CONVERT(VARCHAR(19), rp.last_sync, 120) AS last_sync
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN pdrd.sms jur ON jur.id_sms = s.id_jur_unila AND jur.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.agama ag ON ag.id_agama = pd.id_agama
            LEFT JOIN ref.wilayah w ON w.id_wil = pd.id_wil
            LEFT JOIN ref.jalur_daftar jd ON jd.id_jalur_daftar = rp.id_jalur_daftar
            LEFT JOIN ref.jenis_pendaftaran jp ON jp.id_jns_daftar = rp.id_jns_daftar
            LEFT JOIN ref.jenis_keluar jk ON jk.id_jns_keluar = rp.id_jns_keluar
            OUTER APPLY (
                SELECT TOP 1 CAST(km.ipk AS DECIMAL(4,2)) AS ipk
                FROM pdrd.kuliah_mhs km
                WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                  AND km.ipk IS NOT NULL AND km.ipk > 0
                ORDER BY km.id_smt DESC
            ) ipk_latest
            OUTER APPLY (
                SELECT TOP 1 CASE WHEN km.id_stat_mhs = 'C' THEN 1 ELSE 0 END AS is_cuti
                FROM pdrd.kuliah_mhs km
                WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                ORDER BY km.id_smt DESC
            ) km_latest
            OUTER APPLY (
                SELECT TOP 1 CAST(km.total_sks AS DECIMAL(6,2)) AS total_sks
                FROM pdrd.kuliah_mhs km
                WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                ORDER BY km.id_smt DESC
            ) sks_total
            OUTER APPLY (
                SELECT COUNT(DISTINCT km.id_smt) AS semester
                FROM pdrd.kuliah_mhs km
                WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
            ) sem
            WHERE rp.id_pd = ? AND rp.soft_delete = 0
            ORDER BY rp.id_semester_masuk DESC
        ", [$idPd]);

        // 4) Keluarga (Ayah / Ibu / Wali) — derived dari pdrd.peserta_didik
        //    Fields parent disimpan inline di pd; join ke ref tables utk label
        $keluarga = $this->select("
            SELECT * FROM (
                SELECT 'Ayah' AS status_keluarga,
                    pd.nm_ayah AS nama,
                    pd.nik_ayah AS nik,
                    CONVERT(VARCHAR(10), pd.tgl_lahir_ayah, 120) AS tgl_lahir,
                    pek_a.nm_pekerjaan AS pekerjaan,
                    ph_a.nm_penghasilan AS penghasilan,
                    NULL AS alamat,
                    NULL AS no_hp,
                    NULL AS pendidikan_terakhir,
                    1 AS urut
                FROM pdrd.peserta_didik pd
                LEFT JOIN ref.pekerjaan pek_a ON pek_a.id_pekerjaan = pd.id_pekerjaan_ayah
                LEFT JOIN ref.penghasilan ph_a ON ph_a.id_penghasilan = pd.id_penghasilan_ayah
                WHERE pd.id_pd = ? AND pd.nm_ayah IS NOT NULL AND LTRIM(RTRIM(pd.nm_ayah)) <> ''
                UNION ALL
                SELECT 'Ibu',
                    pd.nm_ibu_kandung,
                    pd.nik_ibu,
                    CONVERT(VARCHAR(10), pd.tgl_lahir_ibu, 120),
                    pek_i.nm_pekerjaan,
                    ph_i.nm_penghasilan,
                    NULL, NULL, NULL, 2
                FROM pdrd.peserta_didik pd
                LEFT JOIN ref.pekerjaan pek_i ON pek_i.id_pekerjaan = pd.id_pekerjaan_ibu
                LEFT JOIN ref.penghasilan ph_i ON ph_i.id_penghasilan = pd.id_penghasilan_ibu
                WHERE pd.id_pd = ? AND pd.nm_ibu_kandung IS NOT NULL AND LTRIM(RTRIM(pd.nm_ibu_kandung)) <> ''
                UNION ALL
                SELECT 'Wali',
                    pd.nm_wali,
                    NULL,
                    CONVERT(VARCHAR(10), pd.tgl_lahir_wali, 120),
                    pek_w.nm_pekerjaan,
                    ph_w.nm_penghasilan,
                    NULL, NULL, NULL, 3
                FROM pdrd.peserta_didik pd
                LEFT JOIN ref.pekerjaan pek_w ON pek_w.id_pekerjaan = pd.id_pekerjaan_wali
                LEFT JOIN ref.penghasilan ph_w ON ph_w.id_penghasilan = pd.id_penghasilan_wali
                WHERE pd.id_pd = ? AND pd.nm_wali IS NOT NULL AND LTRIM(RTRIM(pd.nm_wali)) <> ''
            ) AS keluarga
            ORDER BY urut
        ", [$idPd, $idPd, $idPd]);

        // 5) Riwayat semester (IPK per semester, SKS, status) dari PDDikti
        $riwayat = $this->select("
            SELECT
                CAST(km.id_smt AS VARCHAR(5)) AS id_smt,
                smt.nm_smt AS semester,
                CAST(km.ips AS DECIMAL(4,2)) AS ips,
                CAST(km.ipk AS DECIMAL(4,2)) AS ipk,
                km.sks_semester,
                km.total_sks,
                sm.nm_stat_mhs AS status
            FROM pdrd.kuliah_mhs km
            LEFT JOIN ref.semester smt ON smt.id_smt = km.id_smt
            LEFT JOIN ref.status_mahasiswa sm ON sm.id_stat_mhs = km.id_stat_mhs
            WHERE km.id_reg_pd = ? AND km.soft_delete = 0
            ORDER BY km.id_smt ASC
        ", [$idRegPd]);

        return [
            'siakadu'          => $siakadu,
            'pddikti'          => $pddikti,
            'keluarga'         => $keluarga,
            'riwayat_semester' => $riwayat,
        ];
    }

    /**
     * Get stats summary (for stat cards)
     */
    public function getStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);
        // Tambah multi-unit filter (Filter Unit multi-select)
        $orgFilter .= $this->buildUnitFilter($params, $bindings, $countBindings);

        // Angkatan filter (LEFT(id_semester_masuk, 4))
        $extraFilter = '';
        if (!empty($params['angkatan'])) {
            $extraFilter .= ' AND LEFT(rp.id_semester_masuk, 4) = ?';
            $bindings[] = $params['angkatan'];
        }

        // Note: id_jns_keluar mapping (ref.jenis_keluar):
        //   1 = Lulus, 2 = Mutasi, 3 = Dikeluarkan, 4 = Mengajukan pengunduran diri,
        //   5 = Putus Studi, 6 = Meninggal, 7 = Hilang, dst.
        // CUTI bukan dari id_jns_keluar — tapi dari kuliah_mhs.id_stat_mhs='C' di latest semester.
        $sql = "
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN rp.id_jns_keluar IS NULL AND pd.id_stat_mhs = 'A' THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '1' THEN 1 ELSE 0 END) as lulus,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) IN ('5','3') THEN 1 ELSE 0 END) as do_keluar,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 1 ELSE 0 END) as mutasi,
                -- Keluar (bucket A): semua yang punya SK keluar TAPI bukan Lulus
                SUM(CASE WHEN rp.id_jns_keluar IS NOT NULL AND CAST(rp.id_jns_keluar AS VARCHAR) <> '1' THEN 1 ELSE 0 END) as keluar,
                COUNT(DISTINCT rp.id_sms) as total_prodi,
                COUNT(DISTINCT s.id_fak_unila) as total_fakultas,
                SUM(CASE WHEN pd.jk = 'L' THEN 1 ELSE 0 END) as gender_l,
                SUM(CASE WHEN pd.jk = 'P' THEN 1 ELSE 0 END) as gender_p,
                AVG(CAST(NULLIF(rp.ipk, 0) AS DECIMAL(4,2))) as avg_ipk,
                SUM(CASE WHEN s.id_jenj_didik IN ('20','21','22','23') THEN 1 ELSE 0 END) as jenj_diploma,
                SUM(CASE WHEN s.id_jenj_didik = '30' THEN 1 ELSE 0 END) as jenj_s1,
                SUM(CASE WHEN s.id_jenj_didik = '31' THEN 1 ELSE 0 END) as jenj_profesi,
                SUM(CASE WHEN s.id_jenj_didik = '32' THEN 1 ELSE 0 END) as jenj_spesialis,
                SUM(CASE WHEN s.id_jenj_didik = '35' THEN 1 ELSE 0 END) as jenj_s2,
                SUM(CASE WHEN s.id_jenj_didik = '40' THEN 1 ELSE 0 END) as jenj_s3
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            WHERE rp.soft_delete = 0
              AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              {$orgFilter}
              {$extraFilter}
        ";

        $stats = (array) $this->selectOne($sql, $bindings);

        // Cuti dihitung dari latest kuliah_mhs.id_stat_mhs='C', respect filter org + angkatan + jurusan + jalur.
        $cutiBindings = [];
        $cutiDummy = [];
        $cutiOrg = $this->buildOrgFilter($params, $cutiBindings, $cutiDummy);
        $cutiExtra = '';
        if (!empty($params['angkatan'])) {
            $cutiExtra .= ' AND LEFT(rp.id_semester_masuk, 4) = ?';
            $cutiBindings[] = $params['angkatan'];
        }
        if (!empty($params['id_jurusan'])) {
            $cutiExtra .= ' AND s.id_jur_unila = ?';
            $cutiBindings[] = $params['id_jurusan'];
        }
        if (!empty($params['id_jalur_daftar'])) {
            $cutiExtra .= ' AND rp.id_jalur_daftar = ?';
            $cutiBindings[] = $params['id_jalur_daftar'];
        }
        $cuti = $this->selectScalar("
            SELECT COUNT(DISTINCT km.id_reg_pd)
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
                AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND rp.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE km.soft_delete = 0 AND km.id_stat_mhs = 'C'
              AND km.id_smt = (
                  SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                  WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
              )
              {$cutiOrg}
              {$cutiExtra}
        ", $cutiBindings);
        $stats['cuti'] = (int) $cuti;

        // Meta: last sync dari PDDikti (Feeder Neo) + data source
        $lastSync = $this->selectScalar(
            "SELECT CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM pdrd.reg_pd WHERE soft_delete = 0"
        );
        $stats['last_sync'] = $lastSync ?: null;
        $stats['data_source'] = 'PDDikti / Feeder Neo';

        return $stats;
    }

    /**
     * Get list for CSV export (no pagination)
     */
    public function getExport(array $params): array
    {
        return $this->export(self::BASE_SELECT, $params, self::SEARCH_COLS);
    }

    /**
     * Get distinct angkatan for filter dropdown
     */
    public function getAngkatanList(): array
    {
        return $this->select("
            SELECT DISTINCT LEFT(id_semester_masuk, 4) as angkatan
            FROM pdrd.reg_pd
            WHERE soft_delete = 0 AND id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY angkatan DESC
        ");
    }

    /**
     * Resolve id_pd by NIM (nipd) — utk klik dari halaman KTW yang hanya punya NIM.
     */
    public function resolveByNim(string $nim): ?string
    {
        $row = $this->selectOne("
            SELECT TOP 1 CONVERT(VARCHAR(36), rp.id_pd) AS id_pd
            FROM pdrd.reg_pd rp
            WHERE rp.nipd = ? AND rp.soft_delete = 0
              AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY rp.id_semester_masuk DESC
        ", [$nim]);
        return $row?->id_pd ?: null;
    }

    /**
     * Get distinct tahun lulus for filter dropdown (only for graduates).
     */
    public function getTahunLulusList(): array
    {
        // Filter range tahun realistic: 1965 (berdiri Unila) sampai tahun depan
        $maxYear = (int) date('Y') + 1;
        return $this->select("
            SELECT DISTINCT YEAR(tgl_keluar) AS tahun_lulus
            FROM pdrd.reg_pd
            WHERE soft_delete = 0
              AND id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              AND CAST(id_jns_keluar AS VARCHAR) = '1'
              AND tgl_keluar IS NOT NULL
              AND YEAR(tgl_keluar) BETWEEN 1965 AND ?
            ORDER BY tahun_lulus DESC
        ", [$maxYear]);
    }

    /**
     * Get fakultas list for filter dropdown
     */
    public function getFakultasList(): array
    {
        return $this->select("
            SELECT DISTINCT 
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                fak.nm_lemb as nm_fakultas
            FROM pdrd.sms s
            INNER JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY fak.nm_lemb
        ");
    }

    /**
     * Get prodi list for filter dropdown (optionally filtered by fakultas).
     * Filter HANYA Program Studi (id_jns_sms='3') yang aktif — bukan Jurusan
     * (id_jns_sms='2') yang adalah parent dari prodi. Konsisten dgn portal publik.
     */
    public function getProdiList(?string $idFakultas = null, ?string $idJurusan = null): array
    {
        $bindings = [];
        $filter = '';
        if ($idFakultas) {
            $filter .= ' AND s.id_fak_unila = ?';
            $bindings[] = $idFakultas;
        }
        if ($idJurusan) {
            $filter .= ' AND s.id_jur_unila = ?';
            $bindings[] = $idJurusan;
        }

        return $this->select("
            SELECT DISTINCT
                CONVERT(VARCHAR(36), s.id_sms) as id_sms,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                CONVERT(VARCHAR(36), s.id_jur_unila) as id_jurusan,
                s.nm_lemb as nm_prodi,
                s.id_jenj_didik as jenjang
            FROM pdrd.sms s
            WHERE s.soft_delete = 0
              AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              AND s.id_jns_sms = '3'
              AND s.stat_prodi = 'A'
              AND s.id_fak_unila IS NOT NULL
              {$filter}
            ORDER BY s.nm_lemb
        ", $bindings);
    }

    /**
     * Get jurusan list for filter dropdown (Program Studi parent, id_jns_sms='2').
     * Optionally scoped to fakultas.
     */
    public function getJurusanList(?string $idFakultas = null): array
    {
        $bindings = [];
        $filter = '';
        if ($idFakultas) {
            $filter = ' AND s.id_fak_unila = ?';
            $bindings[] = $idFakultas;
        }

        return $this->select("
            SELECT DISTINCT
                CONVERT(VARCHAR(36), s.id_sms) as id_jurusan,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                s.nm_lemb as nm_jurusan
            FROM pdrd.sms s
            WHERE s.soft_delete = 0
              AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              AND s.id_jns_sms = '2'
              AND s.id_fak_unila IS NOT NULL
              {$filter}
            ORDER BY s.nm_lemb
        ", $bindings);
    }

    /**
     * Get jalur daftar (jalur masuk) list for filter dropdown.
     */
    public function getJalurDaftarList(): array
    {
        return $this->select("
            SELECT DISTINCT
                CAST(jd.id_jalur_daftar AS VARCHAR(36)) as id_jalur_daftar,
                jd.nm_jalur_daftar
            FROM ref.jalur_daftar jd
            WHERE jd.nm_jalur_daftar IS NOT NULL
            ORDER BY jd.nm_jalur_daftar
        ");
    }

    /**
     * Get jenis keluar list (status mahasiswa selain Aktif) untuk filter dropdown.
     * a_pd=1 → relevant utk peserta didik.
     */
    public function getJenisKeluarList(): array
    {
        return $this->select("
            SELECT
                CAST(jk.id_jns_keluar AS VARCHAR(2)) AS id_jns_keluar,
                jk.ket_keluar AS nm_jns_keluar
            FROM ref.jenis_keluar jk
            WHERE jk.a_pd = 1 AND jk.expired_date IS NULL
            ORDER BY jk.id_jns_keluar
        ");
    }

    // ==========================================
    // LULUSAN
    // ==========================================

    private const LULUSAN_SELECT = "
        SELECT
            CONVERT(VARCHAR(36), pd.id_pd) as id_pd,
            pd.nm_pd,
            pd.jk,
            CONVERT(VARCHAR(36), rp.id_reg_pd) as id_reg_pd,
            rp.nipd,
            LEFT(rp.id_semester_masuk, 4) as angkatan,
            CONVERT(VARCHAR(36), rp.id_sms) as id_sms,
            s.nm_lemb as nm_prodi,
            s.id_jenj_didik as jenjang,
            fak.nm_lemb as nm_fakultas,
            CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
            jd.nm_jalur_daftar as jalur_masuk,
            CONVERT(VARCHAR(10), rp.tgl_masuk_sp, 120) as tgl_masuk,
            CONVERT(VARCHAR(10), rp.tgl_keluar, 120) as tgl_lulus,
            DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) as lama_studi_bulan,
            CASE
                WHEN s.id_jenj_didik = '20' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 1 THEN 1
                WHEN s.id_jenj_didik = '21' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 2 THEN 1
                WHEN s.id_jenj_didik = '22' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 3 THEN 1
                WHEN s.id_jenj_didik = '23' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 4 THEN 1
                WHEN s.id_jenj_didik = '30' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 4 THEN 1
                WHEN s.id_jenj_didik IN ('31','32','35') AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 2 THEN 1
                WHEN s.id_jenj_didik = '40' AND ROUND(DATEDIFF(DAY, rp.tgl_masuk_sp, rp.tgl_keluar)/365.25, 2) <= 3 THEN 1
                ELSE 0
            END as tepat_waktu,
            rp.sk_yudisium,
            CONVERT(VARCHAR(10), rp.tgl_sk_yudisium, 120) as tgl_sk_yudisium,
            rp.no_seri_ijazah,
            COALESCE(ipk_latest.ipk, CAST(rp.ipk AS DECIMAL(4,2))) as ipk,
            pd.email,
            pd.tlpn_hp
        FROM pdrd.peserta_didik pd
        INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
        LEFT JOIN ref.jalur_daftar jd ON jd.id_jalur_daftar = rp.id_jalur_daftar
        OUTER APPLY (
            SELECT TOP 1 CAST(km.ipk AS DECIMAL(4,2)) AS ipk
            FROM pdrd.kuliah_mhs km
            WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
              AND km.ipk IS NOT NULL AND km.ipk > 0
            ORDER BY km.id_smt DESC
        ) ipk_latest
        WHERE pd.soft_delete = 0
          AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
          AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
          {WHERE_EXTRA}
    ";

    private const LULUSAN_COUNT = "
        SELECT COUNT(*)
        FROM pdrd.peserta_didik pd
        INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        WHERE pd.soft_delete = 0
          AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
          AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
          {WHERE_EXTRA}
    ";

    public function getLulusanList(array $params): array
    {
        return $this->paginate(
            self::LULUSAN_SELECT,
            self::LULUSAN_COUNT,
            $params,
            ['pd.nm_pd', 'rp.nipd', 'rp.sk_yudisium'],
            ['nm_pd', 'nipd', 'nm_prodi', 'angkatan', 'tgl_lulus', 'ipk', 'lama_studi_bulan'],
            'tgl_lulus',
            'DESC'
        );
    }

    public function getLulusanStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);
        $orgFilter .= $this->buildUnitFilter($params, $bindings, $countBindings);

        $extraFilter = '';
        if (!empty($params['angkatan'])) {
            $extraFilter .= ' AND LEFT(rp.id_semester_masuk, 4) = ?';
            $bindings[] = $params['angkatan'];
        }
        if (!empty($params['id_jurusan'])) {
            $extraFilter .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
        }
        if (!empty($params['tahun_lulus'])) {
            $extraFilter .= ' AND YEAR(rp.tgl_keluar) = ?';
            $bindings[] = $params['tahun_lulus'];
        }

        $stats = (array) $this->selectOne("
            ;WITH lulusan AS (
                SELECT rp.id_reg_pd, rp.id_sms, s.id_fak_unila, s.id_jenj_didik,
                       rp.id_semester_masuk, rp.tgl_masuk_sp, rp.tgl_keluar, pd.jk,
                       COALESCE(
                         (SELECT TOP 1 CAST(km.ipk AS DECIMAL(4,2))
                          FROM pdrd.kuliah_mhs km
                          WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                            AND km.ipk IS NOT NULL AND km.ipk > 0
                          ORDER BY km.id_smt DESC),
                         CAST(NULLIF(rp.ipk, 0) AS DECIMAL(4,2))
                       ) AS ipk_final
                FROM pdrd.reg_pd rp
                INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
                WHERE rp.soft_delete = 0
                  AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
                  AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
                  {$orgFilter}
                  {$extraFilter}
            )
            SELECT
                COUNT(*) as total,
                AVG(ipk_final) as avg_ipk,
                COUNT(DISTINCT id_sms) as total_prodi,
                COUNT(DISTINCT id_fak_unila) as total_fakultas,
                COUNT(DISTINCT LEFT(id_semester_masuk, 4)) as total_angkatan,
                SUM(CASE WHEN jk = 'L' THEN 1 ELSE 0 END) as gender_l,
                SUM(CASE WHEN jk = 'P' THEN 1 ELSE 0 END) as gender_p,
                SUM(CASE WHEN ipk_final >= 3.50 THEN 1 ELSE 0 END) as cumlaude,
                SUM(CASE WHEN ipk_final >= 3.00 AND ipk_final < 3.50 THEN 1 ELSE 0 END) as sangat_memuaskan,
                SUM(CASE WHEN ipk_final < 3.00 THEN 1 ELSE 0 END) as memuaskan,
                SUM(CASE
                    WHEN id_jenj_didik = '30' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 4 THEN 1
                    WHEN id_jenj_didik = '20' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 1 THEN 1
                    WHEN id_jenj_didik = '21' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN id_jenj_didik = '22' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 3 THEN 1
                    WHEN id_jenj_didik = '23' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 4 THEN 1
                    WHEN id_jenj_didik IN ('31','32','35') AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 2 THEN 1
                    WHEN id_jenj_didik = '40' AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar)/365.25, 2) <= 3 THEN 1
                    ELSE 0
                END) as tepat_waktu,
                AVG(CAST(DATEDIFF(MONTH, tgl_masuk_sp, tgl_keluar) AS DECIMAL(8,2))) as avg_lama_studi_bulan,
                SUM(CASE WHEN id_jenj_didik IN ('20','21','22','23') THEN 1 ELSE 0 END) as jenj_diploma,
                SUM(CASE WHEN id_jenj_didik = '30' THEN 1 ELSE 0 END) as jenj_s1,
                SUM(CASE WHEN id_jenj_didik = '31' THEN 1 ELSE 0 END) as jenj_profesi,
                SUM(CASE WHEN id_jenj_didik = '32' THEN 1 ELSE 0 END) as jenj_spesialis,
                SUM(CASE WHEN id_jenj_didik = '35' THEN 1 ELSE 0 END) as jenj_s2,
                SUM(CASE WHEN id_jenj_didik = '40' THEN 1 ELSE 0 END) as jenj_s3
            FROM lulusan
        ", $bindings);

        $lastSync = $this->selectScalar(
            "SELECT CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM pdrd.reg_pd WHERE soft_delete = 0 AND CAST(id_jns_keluar AS VARCHAR) = '1'"
        );
        $stats['last_sync'] = $lastSync ?: null;
        $stats['data_source'] = 'PDDikti / Feeder Neo';

        return $stats;
    }

    // ==========================================
    // AKTIVITAS MAHASISWA
    // ==========================================

    /**
     * Build extra WHERE for aktivitas — supports id_fakultas, id_prodi, id_jns_akt_mhs, tahun.
     */
    private function buildAktivitasWhere(array $params, array &$bindings, array &$countBindings): string
    {
        $where = '';
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $prodiId = $params['id_prodi'] ?? $params['id_sms'];
            $where .= ' AND s.id_sms = ?';
            $bindings[] = $prodiId;
            $countBindings[] = $prodiId;
        } elseif (!empty($params['id_fakultas'])) {
            $where .= ' AND s.id_fak_unila = ?';
            $bindings[] = $params['id_fakultas'];
            $countBindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $where .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
            $countBindings[] = $params['id_jurusan'];
        }
        if (!empty($params['id_jns_akt_mhs'])) {
            $where .= ' AND am.id_jns_akt_mhs = ?';
            $bindings[] = $params['id_jns_akt_mhs'];
            $countBindings[] = $params['id_jns_akt_mhs'];
        }
        if (!empty($params['tahun'])) {
            // tgl_mulai sering NULL; pakai LEFT(id_smt,4) sebagai fallback tahun akademik
            $where .= ' AND LEFT(CAST(am.id_smt AS VARCHAR(5)), 4) = ?';
            $bindings[] = $params['tahun'];
            $countBindings[] = $params['tahun'];
        }
        // Filter Unit multi-select
        $where .= $this->buildUnitFilter($params, $bindings, $countBindings);
        return $where;
    }

    public function getAktivitasList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = max(1, min(200, (int) ($params['limit'] ?? 10)));
        $sortBy = $params['sort_by'] ?? 'id_smt';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $sortable = ['judul', 'jenis_aktivitas', 'nm_prodi', 'id_smt', 'nm_smt'];
        if (!in_array($sortBy, $sortable)) $sortBy = 'id_smt';

        $bindings = [];
        $countBindings = [];
        $where = $this->buildAktivitasWhere($params, $bindings, $countBindings);

        // Search
        if (!empty($params['search'])) {
            $where .= ' AND (am.judul_akt_mhs LIKE ? OR am.lokasi_kegiatan LIKE ?)';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
        }

        // Pakai LOOKUP ke ref.jenis_akt_mhs (BUKAN hardcoded mapping). Sebelumnya hardcode SALAH semua mapping.
        $jenisCase = "ISNULL(jam.nm_jns_akt_mhs, 'Lainnya')";

        $total = (int) $this->selectScalar("
            SELECT COUNT(*)
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE am.soft_delete = 0 {$where}
        ", $countBindings);

        $offset = ($page - 1) * $limit;
        // Anggota: subquery FOR XML PATH untuk concat nama + NPM + peran per aktivitas
        $rows = $this->select("
            SELECT
                CONVERT(VARCHAR(36), am.id_akt_mhs) as id_akt_mhs,
                am.judul_akt_mhs as judul,
                am.id_jns_akt_mhs,
                {$jenisCase} as jenis_aktivitas,
                am.lokasi_kegiatan,
                CONVERT(VARCHAR(10), am.tgl_selesai, 120) as tgl_selesai,
                CAST(am.id_smt AS VARCHAR(5)) as id_smt,
                smt.nm_smt as nm_smt,
                LEFT(CAST(am.id_smt AS VARCHAR(5)), 4) as tahun,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                am.a_komunal,
                anggota.daftar_anggota
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.semester smt ON smt.id_smt = am.id_smt
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            OUTER APPLY (
                SELECT STUFF((
                    SELECT '; ' + a.nm_pd + ' (' + ISNULL(a.nipd, '-') + ') - ' +
                        -- Mapping sesuai feeder-service: 1=Ketua, 2=Anggota, 3=Personal (mhs mandiri, e.g. skripsi)
                        CASE CAST(a.jns_peran_mhs AS VARCHAR(2))
                            WHEN '1' THEN 'Ketua'
                            WHEN '2' THEN 'Anggota'
                            WHEN '3' THEN 'Personal'
                            ELSE 'Lainnya'
                        END
                    FROM pdrd.anggota_akt_mhs a
                    WHERE a.id_akt_mhs = am.id_akt_mhs AND a.soft_delete = 0
                    ORDER BY CAST(a.jns_peran_mhs AS INT), a.nm_pd
                    FOR XML PATH(''), TYPE
                ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS daftar_anggota
            ) anggota
            WHERE am.soft_delete = 0 {$where}
            ORDER BY {$sortBy} {$sortOrder}
            OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
        ", $bindings);

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $limit > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getAktivitasStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $where = $this->buildAktivitasWhere($params, $bindings, $countBindings);

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT am.id_sms) as total_prodi,
                COUNT(DISTINCT s.id_fak_unila) as total_fakultas,
                COUNT(DISTINCT am.id_smt) as total_semester,
                -- Akademik: skripsi/tesis/disertasi/laporan akhir/tugas akhir/bimbingan/penelitian
                -- Canonical id (ref.jenis_akt_mhs): 1=Laporan akhir studi, 2=Tugas akhir, 3=Tesis, 4=Disertasi, 7=Bimbingan akademis, 15=Penelitian/Riset, 22=Skripsi, 23=Kegiatan Penelitian Reguler, 24=Pembelajaran Mandiri
                SUM(CASE WHEN am.id_jns_akt_mhs IN (1,2,3,4,7,15,22,23,24) THEN 1 ELSE 0 END) as akademik,
                -- Non-akademik: 10=Aktivitas kemahasiswaan, 11=PKM, 12=Kompetisi, 16=Proyek Kemanusiaan, 17=Wirausaha, 20=Bela Negara
                SUM(CASE WHEN am.id_jns_akt_mhs IN (10,11,12,16,17,20) THEN 1 ELSE 0 END) as non_akademik,
                -- KKN: 5=Kuliah kerja nyata + 19=Membangun Desa/KKN Tematik
                SUM(CASE WHEN am.id_jns_akt_mhs IN (5,19) THEN 1 ELSE 0 END) as kkn,
                -- PKL/Magang: 6=Kerja praktek/PKL + 13=Magang/Praktik Kerja
                SUM(CASE WHEN am.id_jns_akt_mhs IN (6,13) THEN 1 ELSE 0 END) as pkl,
                -- MBKM (Kampus Merdeka): 13,14,15,16,17,18,19,21,23,24 (Magang, AsistensiMengajar, Penelitian, Kemanusiaan, Wirausaha, Studi Independen, MembangunDesa, PertukaranPelajar, Penelitian Reguler, Pembelajaran Mandiri)
                SUM(CASE WHEN am.id_jns_akt_mhs IN (13,14,15,16,17,18,19,21,23,24) THEN 1 ELSE 0 END) as mbkm,
                SUM(CASE WHEN am.id_jns_akt_mhs IN (15,23) THEN 1 ELSE 0 END) as penelitian,
                -- Pengabdian: 16=Proyek Kemanusiaan + 19=Membangun Desa
                SUM(CASE WHEN am.id_jns_akt_mhs IN (16,19) THEN 1 ELSE 0 END) as pengabdian,
                -- Kompetisi: 12 (canonical)
                SUM(CASE WHEN am.id_jns_akt_mhs = 12 THEN 1 ELSE 0 END) as kompetisi,
                -- Organisasi: 10=Aktivitas kemahasiswaan + 11=PKM
                SUM(CASE WHEN am.id_jns_akt_mhs IN (10,11) THEN 1 ELSE 0 END) as organisasi
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE am.soft_delete = 0 {$where}
        ", $bindings);

        // Top jenis breakdown — LOOKUP ke ref.jenis_akt_mhs (canonical)
        $topJenis = $this->select("
            SELECT TOP 8
                am.id_jns_akt_mhs,
                ISNULL(jam.nm_jns_akt_mhs, 'Lainnya') AS nama_jenis,
                COUNT(*) AS jumlah
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE am.soft_delete = 0 {$where}
            GROUP BY am.id_jns_akt_mhs, jam.nm_jns_akt_mhs
            ORDER BY jumlah DESC
        ", $bindings);

        $stats['by_jenis'] = $topJenis;

        $lastSync = $this->selectScalar(
            "SELECT CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM pdrd.akt_mhs WHERE soft_delete = 0"
        );
        $stats['last_sync'] = $lastSync ?: null;
        $stats['data_source'] = 'PDDikti / Feeder Neo';

        return $stats;
    }

    /**
     * Get distinct tahun aktivitas + jenis list for filter dropdown.
     */
    public function getAktivitasFilterOptions(): array
    {
        // Tahun diambil dari id_smt (format 20231 = 2023 ganjil), karena tgl_mulai sering NULL
        $tahun = $this->select("
            SELECT DISTINCT LEFT(CAST(id_smt AS VARCHAR(5)), 4) AS tahun
            FROM pdrd.akt_mhs
            WHERE soft_delete = 0 AND id_smt IS NOT NULL
              AND TRY_CAST(LEFT(CAST(id_smt AS VARCHAR(5)), 4) AS INT) BETWEEN 2010 AND ?
            ORDER BY tahun DESC
        ", [(int) date('Y') + 1]);

        // LOOKUP canonical ref.jenis_akt_mhs (BUKAN hardcoded). Hanya tampilkan yang benar2 ada di data.
        $jenis = $this->select("
            SELECT DISTINCT
                am.id_jns_akt_mhs,
                ISNULL(jam.nm_jns_akt_mhs, 'Lainnya') AS nama_jenis
            FROM pdrd.akt_mhs am
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE am.soft_delete = 0 AND am.id_jns_akt_mhs IS NOT NULL
            ORDER BY nama_jenis
        ");

        return ['tahun' => $tahun, 'jenis' => $jenis];
    }

    // ==========================================
    // UJIAN MAHASIWA (pdrd.uji_mhs ~10k rows)
    // Source: pdrd.uji_mhs (penguji) JOIN sdm (dosen) + akt_mhs (judul ujian) + ref.jenis_akt_mhs
    //         + OUTER APPLY pdrd.anggota_akt_mhs (mahasiswa yg diuji)
    // ==========================================

    public function getUjianList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = max(1, min(200, (int) ($params['limit'] ?? 20)));
        $sortable = ['judul_ujian', 'jenis_ujian', 'nm_prodi', 'nm_sdm', 'tgl_selesai'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortable) ? $params['sort_by'] : 'tgl_selesai';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $offset = ($page - 1) * $limit;

        $where = '';
        $bindings = [];
        $countBindings = [];

        // Org filter via s.id_fak_unila/id_jur_unila/id_sms
        $where .= $this->buildOrgFilter($params, $bindings, $countBindings);

        if (!empty($params['search'])) {
            $where .= ' AND (am.judul_akt_mhs LIKE ? OR sdm.nm_sdm LIKE ? OR sdm.nidn LIKE ?)';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
        }

        if (!empty($params['jenis_ujian'])) {
            $where .= ' AND jam.nm_jns_akt_mhs = ?';
            $bindings[] = $params['jenis_ujian'];
            $countBindings[] = $params['jenis_ujian'];
        }

        if (!empty($params['tahun'])) {
            $where .= ' AND LEFT(CAST(am.id_smt AS VARCHAR(5)), 4) = ?';
            $bindings[] = $params['tahun'];
            $countBindings[] = $params['tahun'];
        }

        $total = (int) $this->selectScalar("
            SELECT COUNT(*)
            FROM pdrd.uji_mhs um
            INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = um.id_sdm AND sdm.soft_delete = 0
            INNER JOIN pdrd.akt_mhs am ON am.id_akt_mhs = um.id_akt_mhs AND am.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE um.soft_delete = 0 {$where}
        ", $countBindings);

        $rows = $this->select("
            SELECT
                CONVERT(VARCHAR(36), um.id_uji_mhs) as id_uji_mhs,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                um.urutan_uji,
                CASE CAST(um.urutan_uji AS VARCHAR(2))
                    WHEN '1' THEN 'Ketua' WHEN '2' THEN 'Penguji 2' WHEN '3' THEN 'Penguji 3'
                    WHEN '4' THEN 'Penguji 4' WHEN '5' THEN 'Penguji 5' ELSE 'Penguji ' + CAST(um.urutan_uji AS VARCHAR(2))
                END as peran_uji,
                CONVERT(VARCHAR(36), am.id_akt_mhs) as id_akt_mhs,
                am.judul_akt_mhs as judul_ujian,
                ISNULL(jam.nm_jns_akt_mhs, 'Lainnya') as jenis_ujian,
                CONVERT(VARCHAR(10), am.tgl_selesai, 120) as tgl_selesai,
                CAST(am.id_smt AS VARCHAR(5)) as id_smt,
                LEFT(CAST(am.id_smt AS VARCHAR(5)), 4) as tahun,
                (SELECT TOP 1 aam.nm_pd FROM pdrd.anggota_akt_mhs aam
                 WHERE aam.id_akt_mhs = am.id_akt_mhs AND aam.soft_delete = 0
                 ORDER BY aam.jns_peran_mhs) as nm_mahasiswa,
                (SELECT TOP 1 aam.nipd FROM pdrd.anggota_akt_mhs aam
                 WHERE aam.id_akt_mhs = am.id_akt_mhs AND aam.soft_delete = 0
                 ORDER BY aam.jns_peran_mhs) as nipd_mahasiswa,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas
            FROM pdrd.uji_mhs um
            INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = um.id_sdm AND sdm.soft_delete = 0
            INNER JOIN pdrd.akt_mhs am ON am.id_akt_mhs = um.id_akt_mhs AND am.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE um.soft_delete = 0 {$where}
            ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", array_merge($bindings, [$offset, $limit]));

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getUjianStats(array $params = []): array
    {
        $where = '';
        $bindings = [];
        $dummy = [];
        $where .= $this->buildOrgFilter($params, $bindings, $dummy);

        $row = (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT um.id_sdm) as total_dosen,
                COUNT(DISTINCT um.id_akt_mhs) as total_ujian,
                COUNT(DISTINCT jam.nm_jns_akt_mhs) as total_jenis
            FROM pdrd.uji_mhs um
            INNER JOIN pdrd.akt_mhs am ON am.id_akt_mhs = um.id_akt_mhs AND am.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE um.soft_delete = 0 {$where}
        ", $bindings);

        $byJenis = $this->select("
            SELECT TOP 20 ISNULL(jam.nm_jns_akt_mhs, 'Lainnya') as jenis, COUNT(*) as jumlah
            FROM pdrd.uji_mhs um
            INNER JOIN pdrd.akt_mhs am ON am.id_akt_mhs = um.id_akt_mhs AND am.soft_delete = 0
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs AND jam.expired_date IS NULL
            WHERE um.soft_delete = 0 {$where}
            GROUP BY jam.nm_jns_akt_mhs
            ORDER BY COUNT(*) DESC
        ", $bindings);
        $row['by_jenis'] = array_map(fn($r) => (array) $r, $byJenis);
        return $row;
    }
}
