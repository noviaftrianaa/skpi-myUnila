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

        $sql = "
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN rp.id_jns_keluar IS NULL THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '1' THEN 1 ELSE 0 END) as lulus,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '2' THEN 1 ELSE 0 END) as do_keluar,
                SUM(CASE WHEN CAST(rp.id_jns_keluar AS VARCHAR) = '3' THEN 1 ELSE 0 END) as cuti,
                COUNT(DISTINCT rp.id_sms) as total_prodi,
                COUNT(DISTINCT s.id_fak_unila) as total_fakultas
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rp.soft_delete = 0
              AND rp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              {$orgFilter}
        ";

        return (array) $this->selectOne($sql, $bindings);
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
}
