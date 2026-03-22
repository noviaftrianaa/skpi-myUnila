<?php

namespace App\Repositories\DataUnila;

class AkademikDataRepository extends BaseDataRepository
{
    public function getProdiList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id_sms,
                s.nm_lemb as nm_prodi,
                s.id_jenj_didik as jenjang,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                (SELECT TOP 1 la.nm_akred FROM pdrd.akreditasi_prodi ap 
                 JOIN ref.nilai_akred la ON la.id_akred = ap.id_akred 
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) as akreditasi,
                (SELECT COUNT(*) FROM pdrd.reg_pd rp WHERE rp.id_sms = s.id_sms AND rp.soft_delete = 0 AND rp.id_jns_keluar IS NULL) as mhs_aktif,
                (SELECT COUNT(DISTINCT rpt.id_sdm) FROM pdrd.reg_ptk rpt WHERE rpt.id_sms = s.id_sms AND rpt.soft_delete = 0) as jml_dosen
            FROM pdrd.sms s
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.sms s WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['s.nm_lemb'], ['nm_prodi','nm_fakultas','akreditasi','mhs_aktif'], 'nm_prodi', 'ASC');
    }

    public function getAkreditasiList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), ap.id_akreditasi_prodi) as id,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                la.nm_akred as peringkat,
                lak.nm_lemb as lembaga,
                ap.sk_akreditasi_prodi as no_sk,
                CONVERT(VARCHAR(10), ap.tanggal_sk_akreditasi_prodi, 120) as tgl_sk,
                CONVERT(VARCHAR(10), ap.tst_sk_akreditasi_prodi, 120) as tgl_expired,
                ap.a_aktif
            FROM pdrd.akreditasi_prodi ap
            JOIN pdrd.sms s ON s.id_sms = ap.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.nilai_akred la ON la.id_akred = ap.id_akred
            LEFT JOIN ref.lembaga_akred lak ON lak.id_lemb_akred = ap.id_lemb_akred
            WHERE ap.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.akreditasi_prodi ap JOIN pdrd.sms s ON s.id_sms = ap.id_sms WHERE ap.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['s.nm_lemb','ap.sk_akreditasi_prodi','la.nm_akred'], ['nm_prodi','peringkat','tgl_sk'], 'tgl_sk', 'DESC');
    }

    public function getMatkulList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), mk.id_mk) as id_mk,
                mk.kode_mk,
                mk.nm_mk,
                mk.sks_mk,
                mk.sks_tm, mk.sks_prak, mk.sks_prak_lap, mk.sks_sim,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                jmk.nm_jns_mk as jenis_mk
            FROM pdrd.matkul mk
            JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.jenis_mk jmk ON jmk.id_jns_mk = mk.id_jns_mk
            WHERE mk.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.matkul mk JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0 WHERE mk.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['mk.nm_mk','mk.kode_mk'], ['nm_mk','kode_mk','sks_mk','nm_prodi'], 'nm_mk', 'ASC');
    }
}
