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
            CASE 
                WHEN rp.id_jns_keluar IS NULL THEN 'Aktif'
                WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '1' THEN 'Lulus'
                WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 'DO'
                WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '3' THEN 'Cuti'
                ELSE 'Lainnya'
            END as status,
            CONVERT(VARCHAR(10), rp.tgl_keluar, 120) as tgl_keluar,
            ref_ag.nm_agama,
            pd.email,
            pd.tlpn_hp
        FROM pdrd.peserta_didik pd
        INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
        LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = pd.id_agama
        WHERE pd.soft_delete = 0
          AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
          {WHERE_EXTRA}
    ";

    private const BASE_COUNT = "
        SELECT COUNT(*)
        FROM pdrd.peserta_didik pd
        INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        WHERE pd.soft_delete = 0
          AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
          {WHERE_EXTRA}
    ";

    private const SEARCH_COLS = ['pd.nm_pd', 'rp.nipd', 'pd.nik', 'pd.nisn', 'pd.email'];

    private const SORTABLE_COLS = [
        'nm_pd', 'nipd', 'nm_prodi', 'nm_fakultas', 'angkatan', 'status', 'id_semester_masuk',
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
                pd.nm_ayah, pd.nm_ibu,
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
                    WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 'DO'
                    WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '3' THEN 'Cuti'
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
     * Get stats summary (for stat cards)
     */
    public function getStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        // Note: id_jns_keluar mapping (ref.jenis_keluar):
        //   1 = Lulus, 2 = Mutasi, 3 = Dikeluarkan, 4 = Mengajukan pengunduran diri,
        //   5 = Putus Studi, 6 = Meninggal, 7 = Hilang, dst.
        // CUTI bukan dari id_jns_keluar — tapi dari kuliah_mhs.id_stat_mhs='C' di latest semester.
        $sql = "
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN rp.id_jns_keluar IS NULL THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '1' THEN 1 ELSE 0 END) as lulus,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) IN ('5','3') THEN 1 ELSE 0 END) as do_keluar,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 1 ELSE 0 END) as mutasi,
                COUNT(DISTINCT rp.id_sms) as total_prodi,
                COUNT(DISTINCT s.id_fak_unila) as total_fakultas
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rp.soft_delete = 0
              AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              {$orgFilter}
        ";

        $stats = (array) $this->selectOne($sql, $bindings);

        // Cuti diambil dari latest kuliah_mhs.id_stat_mhs='C' — konsisten dgn Pimpinan.
        $cuti = $this->selectScalar("
            SELECT COUNT(DISTINCT km.id_reg_pd)
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
                AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND rp.soft_delete = 0
            WHERE km.soft_delete = 0 AND km.id_stat_mhs = 'C'
              AND km.id_smt = (
                  SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                  WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
              )
        ");
        $stats['cuti'] = (int) $cuti;

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
     * Get prodi list for filter dropdown (optionally filtered by fakultas)
     */
    public function getProdiList(?string $idFakultas = null): array
    {
        $bindings = [];
        $filter = '';
        if ($idFakultas) {
            $filter = ' AND s.id_fak_unila = ?';
            $bindings[] = $idFakultas;
        }

        return $this->select("
            SELECT DISTINCT 
                CONVERT(VARCHAR(36), s.id_sms) as id_sms,
                s.nm_lemb as nm_prodi,
                s.id_jenj_didik as jenjang
            FROM pdrd.sms s
            WHERE s.soft_delete = 0 
              AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              {$filter}
            ORDER BY s.nm_lemb
        ", $bindings);
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
            CONVERT(VARCHAR(10), rp.tgl_keluar, 120) as tgl_lulus,
            rp.ipk,
            pd.email,
            pd.tlpn_hp
        FROM pdrd.peserta_didik pd
        INNER JOIN pdrd.reg_pd rp ON rp.id_pd = pd.id_pd AND rp.soft_delete = 0
        INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
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
            ['pd.nm_pd', 'rp.nipd'],
            ['nm_pd', 'nipd', 'nm_prodi', 'angkatan', 'tgl_lulus', 'ipk'],
            'tgl_lulus',
            'DESC'
        );
    }

    public function getLulusanStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                AVG(CAST(rp.ipk AS DECIMAL(4,2))) as avg_ipk,
                COUNT(DISTINCT rp.id_sms) as total_prodi,
                COUNT(DISTINCT LEFT(rp.id_semester_masuk, 4)) as total_angkatan
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rp.soft_delete = 0
              AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              AND CAST(rp.id_jns_keluar AS VARCHAR) = '1'
              {$orgFilter}
        ", $bindings);
    }

    // ==========================================
    // AKTIVITAS MAHASISWA
    // ==========================================

    public function getAktivitasList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), am.id_akt_mhs) as id_akt_mhs,
                am.judul_akt_mhs as judul,
                am.id_jns_akt_mhs,
                CASE am.id_jns_akt_mhs
                    WHEN 1  THEN 'KKN'
                    WHEN 2  THEN 'PKL/Magang'
                    WHEN 3  THEN 'Pertukaran Mahasiswa'
                    WHEN 4  THEN 'Penelitian'
                    WHEN 5  THEN 'Pengabdian Masyarakat'
                    WHEN 6  THEN 'Wirausaha'
                    WHEN 7  THEN 'Proyek Kemanusiaan'
                    WHEN 8  THEN 'Studi/Proyek Independen'
                    WHEN 9  THEN 'Asistensi Mengajar'
                    WHEN 10 THEN 'Kompetisi'
                    WHEN 11 THEN 'Lomba'
                    WHEN 12 THEN 'Beasiswa'
                    WHEN 13 THEN 'Organisasi'
                    WHEN 14 THEN 'Seminar/Konferensi'
                    WHEN 15 THEN 'Workshop/Pelatihan'
                    WHEN 16 THEN 'Proyek Sosial'
                    WHEN 17 THEN 'Seni & Budaya'
                    WHEN 18 THEN 'Olahraga'
                    WHEN 19 THEN 'Keagamaan'
                    WHEN 20 THEN 'Publikasi'
                    WHEN 21 THEN 'Penghargaan'
                    WHEN 22 THEN 'Sertifikasi'
                    WHEN 23 THEN 'MBKM'
                    ELSE 'Lainnya'
                END as jenis_aktivitas,
                am.lokasi_kegiatan,
                CONVERT(VARCHAR(10), am.tgl_mulai, 120) as tgl_mulai,
                CONVERT(VARCHAR(10), am.tgl_selesai, 120) as tgl_selesai,
                CAST(am.id_smt AS VARCHAR(5)) as id_smt,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                am.a_komunal
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE am.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE am.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['am.judul_akt_mhs', 'am.lokasi_kegiatan'],
            ['judul', 'jenis_aktivitas', 'nm_prodi', 'id_smt', 'tgl_mulai'],
            'id_smt', 'DESC'
        );
    }

    public function getAktivitasStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT am.id_sms) as total_prodi,
                COUNT(DISTINCT am.id_smt) as total_semester,
                SUM(CASE WHEN am.id_jns_akt_mhs IN (1,2,3,4,5,6,7,8,9,23) THEN 1 ELSE 0 END) as akademik,
                SUM(CASE WHEN am.id_jns_akt_mhs IN (10,11,14,15,17,18) THEN 1 ELSE 0 END) as non_akademik
            FROM pdrd.akt_mhs am
            INNER JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE am.soft_delete = 0
              {$orgFilter}
        ", $bindings);
    }
}
