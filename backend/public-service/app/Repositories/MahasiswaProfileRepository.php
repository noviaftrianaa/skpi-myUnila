<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

class MahasiswaProfileRepository
{
    protected $unilaIdSp;
    protected $tahunAjaran;

    public function __construct()
    {
        $this->unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $this->tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();
    }

    /**
     * Get basic mahasiswa info
     */
    public function getBasicInfo(string $idPd): ?object
    {
        $sql = "
            SELECT
                pd.id_pd,
                pd.nm_pd AS nama,
                pd.jk AS jenis_kelamin
            FROM pdrd.peserta_didik AS pd
            WHERE pd.id_pd = ?
                AND pd.soft_delete = 0
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idPd]);

        return !empty($result) ? $result[0] : null;
    }

    /**
     * Get mahasiswa homebase info (registration and prodi)
     */
    public function getHomebaseInfo(string $idPd): array
    {
        $sql = "
            SELECT
                reg.id_reg_pd,
                reg.nipd AS nim,
                sms.nm_lemb AS nama_prodi,
                sms.id_sms,
                jenj.nm_jenj_didik AS jenjang,
                reg.tgl_masuk_sp,
                reg.tgl_keluar,
                jk.ket_keluar,
                smt_masuk.nm_smt AS semester_masuk,
                -- Get fakultas
                fak.nm_lemb AS nama_fakultas,
                -- Get jurusan
                jur.nm_lemb AS nama_jurusan,
                CASE
                    WHEN CAST(reg.id_jns_keluar AS VARCHAR(10)) = '1' THEN 'Lulus'
                    WHEN reg.id_jns_keluar IS NULL THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS status
            FROM pdrd.reg_pd AS reg
            INNER JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.id_sp = ?
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN ref.jenis_keluar AS jk
                ON jk.id_jns_keluar = reg.id_jns_keluar
                AND jk.expired_date IS NULL
            LEFT JOIN ref.semester AS smt_masuk
                ON smt_masuk.id_smt = reg.id_semester_masuk
                AND smt_masuk.expired_date IS NULL
            -- Join fakultas
            LEFT JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            -- Join jurusan
            LEFT JOIN pdrd.sms AS jur
                ON jur.id_sms = sms.id_jur_unila
                AND jur.soft_delete = 0
            WHERE reg.id_pd = ?
                AND reg.soft_delete = 0
            ORDER BY reg.tgl_masuk_sp DESC
        ";

        return DB::connection('sqlsrv')->select($sql, [$this->unilaIdSp, $idPd]);
    }

    /**
     * Get status semester mahasiswa
     */
    public function getStatusSemester(string $idRegPd): array
    {
        $sql = "
            SELECT
                km.id_smt,
                smt.nm_smt AS semester,
                sm.nm_stat_mhs AS status,
                km.sks_semester AS sks_diambil,
                km.total_sks AS total_sks
            FROM pdrd.kuliah_mhs AS km
            INNER JOIN ref.semester AS smt
                ON smt.id_smt = km.id_smt
                AND smt.expired_date IS NULL
            LEFT JOIN ref.status_mahasiswa AS sm
                ON sm.id_stat_mhs = km.id_stat_mhs
                AND sm.expired_date IS NULL
            WHERE km.id_reg_pd = ?
                AND km.soft_delete = 0
            ORDER BY km.id_smt DESC
        ";

        return DB::connection('sqlsrv')->select($sql, [$idRegPd]);
    }

    /**
     * Get mata kuliah yang sudah diambil
     */
    public function getMataKuliah(string $idRegPd): array
    {
        $sql = "
            SELECT
                kk.id_smt,
                smt.nm_smt AS semester,
                mk.kode_mk,
                mk.nm_mk AS nama_mk,
                kk.sks_mk AS sks,
                nilai.nilai_huruf,
                nilai.nilai_indeks
            FROM pdrd.nilai_smt_mhs AS nilai
            INNER JOIN pdrd.kelas_kuliah AS kk
                ON kk.id_kls = nilai.id_kls
                AND kk.soft_delete = 0
            INNER JOIN pdrd.matkul AS mk
                ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
            INNER JOIN ref.semester AS smt
                ON smt.id_smt = kk.id_smt
                AND smt.expired_date IS NULL
            WHERE nilai.id_reg_pd = ?
                AND nilai.soft_delete = 0
            ORDER BY kk.id_smt DESC, mk.kode_mk ASC
        ";

        return DB::connection('sqlsrv')->select($sql, [$idRegPd]);
    }
}
