<?php

namespace App\Repositories\DataUnila;

class DosenDataRepository extends BaseDataRepository
{
    private const BASE_SELECT = "
        SELECT
            CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
            sdm.nm_sdm,
            sdm.jk,
            sdm.nidn,
            sdm.nip,
            sdm.nik,
            CONVERT(VARCHAR(10), sdm.tgl_lahir, 120) as tgl_lahir,
            sdm.tmpt_lahir,
            sdm.email,
            sdm.no_hp,
            CONVERT(VARCHAR(36), rp.id_sms) as id_sms,
            s.nm_lemb as nm_prodi,
            fak.nm_lemb as nm_fakultas,
            CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
            ref_ag.nm_agama,
            jf.nm_jabfung as jabatan_fungsional,
            CASE 
                WHEN sdm.id_stat_aktif = 1 THEN 'Aktif'
                WHEN sdm.id_stat_aktif = 2 THEN 'Non-Aktif'
                WHEN sdm.id_stat_aktif = 3 THEN 'Pensiun'
                ELSE 'Lainnya'
            END as status,
            CASE WHEN sdm.id_jns_sdm = 1 THEN 'Dosen' ELSE 'Tendik' END as jenis_sdm
        FROM pdrd.sdm sdm
        LEFT JOIN pdrd.reg_ptk rp ON rp.id_sdm = sdm.id_sdm AND rp.soft_delete = 0
        LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
        LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = sdm.id_agama
        LEFT JOIN (
            SELECT rf.id_sdm, j.nm_jabfung,
                   ROW_NUMBER() OVER(PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) as rn
            FROM pdrd.rwy_fungsional rf
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            WHERE rf.soft_delete = 0
        ) jf ON jf.id_sdm = sdm.id_sdm AND jf.rn = 1
        WHERE sdm.soft_delete = 0
          {WHERE_EXTRA}
    ";

    private const BASE_COUNT = "
        SELECT COUNT(DISTINCT sdm.id_sdm)
        FROM pdrd.sdm sdm
        LEFT JOIN pdrd.reg_ptk rp ON rp.id_sdm = sdm.id_sdm AND rp.soft_delete = 0
        LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        WHERE sdm.soft_delete = 0
          {WHERE_EXTRA}
    ";

    private const SEARCH_COLS = ['sdm.nm_sdm', 'sdm.nidn', 'sdm.nip', 'sdm.nik', 'sdm.email'];
    private const SORTABLE_COLS = ['nm_sdm', 'nidn', 'nip', 'nm_prodi', 'nm_fakultas', 'jabatan_fungsional', 'status'];

    public function getList(array $params): array
    {
        return $this->paginate(
            self::BASE_SELECT, self::BASE_COUNT, $params,
            self::SEARCH_COLS, self::SORTABLE_COLS, 'nm_sdm', 'ASC'
        );
    }

    public function getDetail(string $idSdm): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm, sdm.jk, sdm.nidn, sdm.nip, sdm.nik,
                sdm.tmpt_lahir, CONVERT(VARCHAR(10), sdm.tgl_lahir, 120) as tgl_lahir,
                sdm.email, sdm.no_hp, sdm.npwp,
                sdm.jln, sdm.rt, sdm.rw, sdm.nm_dsn, sdm.ds_kel, sdm.kode_pos,
                s.nm_lemb as nm_prodi, fak.nm_lemb as nm_fakultas,
                ref_ag.nm_agama,
                CASE WHEN sdm.id_stat_aktif = 1 THEN 'Aktif' WHEN sdm.id_stat_aktif = 2 THEN 'Non-Aktif' WHEN sdm.id_stat_aktif = 3 THEN 'Pensiun' ELSE 'Lainnya' END as status,
                CASE WHEN sdm.id_jns_sdm = 1 THEN 'Dosen' ELSE 'Tendik' END as jenis_sdm
            FROM pdrd.sdm sdm
            LEFT JOIN pdrd.reg_ptk rp ON rp.id_sdm = sdm.id_sdm AND rp.soft_delete = 0
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = sdm.id_agama
            WHERE sdm.soft_delete = 0 AND sdm.id_sdm = ?
        ";
        return $this->selectOne($sql, [$idSdm]);
    }

    public function getStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        $sql = "
            SELECT
                COUNT(DISTINCT sdm.id_sdm) as total,
                SUM(CASE WHEN sdm.id_stat_aktif = 1 THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN sdm.id_jns_sdm = 1 THEN 1 ELSE 0 END) as dosen,
                SUM(CASE WHEN sdm.id_jns_sdm != 1 OR sdm.id_jns_sdm IS NULL THEN 1 ELSE 0 END) as tendik,
                SUM(CASE WHEN sdm.nidn IS NOT NULL AND sdm.nidn != '' THEN 1 ELSE 0 END) as ber_nidn
            FROM pdrd.sdm sdm
            LEFT JOIN pdrd.reg_ptk rp ON rp.id_sdm = sdm.id_sdm AND rp.soft_delete = 0
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE sdm.soft_delete = 0
              {$orgFilter}
        ";
        return (array) $this->selectOne($sql, $bindings);
    }

    public function getRiwayatFungsional(string $idSdm): array
    {
        return $this->select("
            SELECT 
                j.nm_jabfung, rf.sk_jabfung,
                CONVERT(VARCHAR(10), rf.tmt_sk_jabfung, 120) as tmt_sk_jabfung,
                rf.angka_kredit
            FROM pdrd.rwy_fungsional rf
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            WHERE rf.soft_delete = 0 AND rf.id_sdm = ?
            ORDER BY rf.tmt_sk_jabfung DESC
        ", [$idSdm]);
    }

    public function getRiwayatPendidikan(string $idSdm): array
    {
        return $this->select("
            SELECT
                rpf.nm_sp_formal as institusi,
                rpf.gelar as gelar,
                rpf.bidang_studi,
                CONVERT(VARCHAR(10), rpf.thn_lulus, 120) as thn_lulus,
                jp.nm_jenj_didik as jenjang
            FROM pdrd.rwy_pend_formal rpf
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik
            WHERE rpf.soft_delete = 0 AND rpf.id_sdm = ?
            ORDER BY rpf.thn_lulus DESC
        ", [$idSdm]);
    }

    public function getSertifikasi(string $idSdm): array
    {
        return $this->select("
            SELECT
                rs.nm_sert, rs.no_sert,
                CONVERT(VARCHAR(10), rs.tgl_sert, 120) as tgl_sert,
                rs.bidang_studi
            FROM pdrd.rwy_sertifikasi rs
            WHERE rs.soft_delete = 0 AND rs.id_sdm = ?
            ORDER BY rs.tgl_sert DESC
        ", [$idSdm]);
    }

    public function getExport(array $params): array
    {
        return $this->export(self::BASE_SELECT, $params, self::SEARCH_COLS);
    }
}
