<?php

namespace App\Repositories;

class PdutRepository extends BaseRepository
{
    /*
    |--------------------------------------------------------------------------
    | MAHASISWA
    |--------------------------------------------------------------------------
    */

    public function getMahasiswaByNim(string $nim): ?object
    {
        $sql = "
            SELECT
                pd.id_pd,
                pd.nm_pd AS nama,
                reg.nipd AS nim,
                reg.id_sms,
                sms.kode_prodi,
                sms.nm_lemb AS prodi
            FROM pdrd.peserta_didik pd
            INNER JOIN pdrd.reg_pd reg
                ON pd.id_pd = reg.id_pd
            INNER JOIN pdrd.sms sms
                ON reg.id_sms = sms.id_sms
            WHERE reg.nipd = ?
                AND pd.soft_delete = 0
                AND reg.soft_delete = 0
                AND sms.soft_delete = 0
        ";

        return $this->pdutSelectOne($sql, [$nim]);
    }

    public function searchMahasiswa(string $keyword): array
    {
        $sql = "
            SELECT TOP 20
                pd.id_pd,
                pd.nm_pd AS nama,
                reg.nipd AS nim,
                sms.kode_prodi,
                sms.nm_lemb AS prodi
            FROM pdrd.peserta_didik pd
            INNER JOIN pdrd.reg_pd reg
                ON pd.id_pd = reg.id_pd
            INNER JOIN pdrd.sms sms
                ON reg.id_sms = sms.id_sms
            WHERE
                (
                    pd.nm_pd LIKE ?
                    OR reg.nipd LIKE ?
                )
                AND pd.soft_delete = 0
                AND reg.soft_delete = 0
                AND sms.soft_delete = 0
            ORDER BY pd.nm_pd
        ";

        return $this->pdutSelect($sql, [
            "%{$keyword}%",
            "%{$keyword}%"
        ]);
    }

    public function existsMahasiswa(string $nim): bool
    {
        return $this->getMahasiswaByNim($nim) !== null;
    }

    /*
    |--------------------------------------------------------------------------
    | DOSEN
    |--------------------------------------------------------------------------
    */

    public function getDosenByNidn(string $nidn): ?object
    {
        $sql = "
            SELECT
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                reg.nidn,
                reg.id_sms,
                sms.kode_prodi,
                sms.nm_lemb AS prodi
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk reg
                ON sdm.id_sdm = reg.id_sdm
            INNER JOIN pdrd.sms sms
                ON reg.id_sms = sms.id_sms
            WHERE reg.nidn = ?
                AND sdm.soft_delete = 0
                AND reg.soft_delete = 0
                AND sms.soft_delete = 0
        ";

        return $this->pdutSelectOne($sql, [$nidn]);
    }

    public function searchDosen(string $keyword): array
    {
        $sql = "
            SELECT TOP 20
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                reg.nidn,
                sms.kode_prodi,
                sms.nm_lemb AS prodi
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk reg
                ON sdm.id_sdm = reg.id_sdm
            INNER JOIN pdrd.sms sms
                ON reg.id_sms = sms.id_sms
            WHERE
                (
                    sdm.nm_sdm LIKE ?
                    OR reg.nidn LIKE ?
                )
                AND sdm.soft_delete = 0
                AND reg.soft_delete = 0
                AND sms.soft_delete = 0
            ORDER BY sdm.nm_sdm
        ";

        return $this->pdutSelect($sql, [
            "%{$keyword}%",
            "%{$keyword}%"
        ]);
    }

    public function existsDosen(string $nidn): bool
    {
        return $this->getDosenByNidn($nidn) !== null;
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN PRODI
    |--------------------------------------------------------------------------
    */

    public function getAdminProdi(): array
    {
        $sql = "
            SELECT
                p.id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                pr.nm_peran,
                u.nm_lemb AS organisasi
            FROM man_akses.pengguna p
            INNER JOIN man_akses.role_pengguna rp
                ON p.id_pengguna = rp.id_pengguna
            INNER JOIN man_akses.peran pr
                ON rp.id_peran = pr.id_peran
            LEFT JOIN man_akses.unit_organisasi u
                ON rp.id_organisasi = u.id_organisasi
            WHERE
                pr.nm_peran = 'Admin Prodi'
                AND p.soft_delete = 0
                AND rp.soft_delete = 0
            ORDER BY p.nm_pengguna
        ";

        return $this->pdutSelect($sql);
    }
}