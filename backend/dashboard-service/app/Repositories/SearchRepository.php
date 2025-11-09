<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

class SearchRepository
{
    protected $unilaIdSp;
    protected $tahunAjaran;

    public function __construct()
    {
        $this->unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $this->tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();
    }

    /**
     * Search mahasiswa by name, NIM, or prodi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchMahasiswa(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                pd.id_pd,
                pd.nm_pd AS nama,
                reg.nipd AS nim,
                sms.nm_lemb AS prodi,
                jenj.nm_jenj_didik AS jenjang,
                CASE
                    WHEN pd.id_stat_mhs = 'A' AND kmh.id_stat_mhs = 'A' THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS status,
                pd.jk AS jenis_kelamin
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN pdrd.kuliah_mhs AS kmh
                ON kmh.id_reg_pd = reg.id_reg_pd
                AND kmh.soft_delete = 0
                AND kmh.id_smt = (
                    SELECT TOP 1 id_smt
                    FROM ref.semester
                    WHERE expired_date IS NULL
                    AND a_periode_aktif = 1
                    ORDER BY id_smt DESC
                )
            WHERE pd.soft_delete = 0
                AND (
                    pd.nm_pd LIKE ?
                    OR reg.nipd LIKE ?
                    OR sms.nm_lemb LIKE ?
                )
            ORDER BY pd.nm_pd
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sqlsrv')->select($sql, [
            $limit,
            $this->unilaIdSp,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search dosen by name, NIDN, NIP, or prodi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchDosen(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                sdm.nidn,
                sdm.nip,
                COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                sms.nm_lemb AS prodi_homebase,
                jenj.nm_jenj_didik AS jenjang_prodi,
                sdm.jk AS jenis_kelamin
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND (
                    sdm.nm_sdm LIKE ?
                    OR sdm.nidn LIKE ?
                    OR sdm.nip LIKE ?
                    OR sms.nm_lemb LIKE ?
                )
            ORDER BY sdm.nm_sdm
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sqlsrv')->select($sql, [
            $limit,
            $this->unilaIdSp,
            $this->tahunAjaran,
            $searchPattern,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search program studi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchProdi(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                sms.id_sms,
                sms.nm_lemb AS nama_prodi,
                jenj.nm_jenj_didik AS jenjang,
                sms.kode_prodi,
                sms.stat_prodi AS status,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN pdrd.reg_pd AS reg
                ON reg.id_sms = sms.id_sms
                AND reg.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                AND pd.id_stat_mhs = 'A'
            WHERE sms.soft_delete = 0
                AND CAST(sms.id_sp AS VARCHAR(50)) = ?
                AND (
                    sms.nm_lemb LIKE ?
                    OR sms.kode_prodi LIKE ?
                    OR jenj.nm_jenj_didik LIKE ?
                )
            GROUP BY
                sms.id_sms,
                sms.nm_lemb,
                jenj.nm_jenj_didik,
                sms.kode_prodi,
                sms.stat_prodi
            ORDER BY sms.nm_lemb
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sqlsrv')->select($sql, [
            $limit,
            $this->unilaIdSp,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search penelitian
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPenelitian(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                penelitian.id_penelitian,
                penelitian.judul,
                penelitian.tahun_usulan AS tahun,
                penelitian.skim,
                sdm.nm_sdm AS ketua_peneliti,
                COALESCE(bidang.nm_bidang_ilmu, 'Tidak Ada') AS bidang_ilmu
            FROM penelitian
            LEFT JOIN sdm ON sdm.id_sdm = penelitian.id_sdm
            LEFT JOIN bidang_ilmu AS bidang ON bidang.id_bidang_ilmu = penelitian.id_bidang_ilmu
            WHERE (
                penelitian.judul LIKE ?
                OR sdm.nm_sdm LIKE ?
                OR penelitian.skim LIKE ?
            )
            ORDER BY penelitian.tahun_usulan DESC
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sister')->select($sql, [
            $limit,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search publikasi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPublikasi(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                publikasi.id_publikasi,
                publikasi.judul,
                publikasi.tahun,
                publikasi.jenis_publikasi,
                publikasi.penerbit,
                sdm.nm_sdm AS penulis_utama
            FROM publikasi
            LEFT JOIN sdm ON sdm.id_sdm = publikasi.id_sdm
            WHERE (
                publikasi.judul LIKE ?
                OR sdm.nm_sdm LIKE ?
                OR publikasi.penerbit LIKE ?
            )
            ORDER BY publikasi.tahun DESC
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sister')->select($sql, [
            $limit,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search pengabdian
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPengabdian(string $query, int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                pengabdian.id_pengabdian,
                pengabdian.judul,
                pengabdian.tahun_usulan AS tahun,
                pengabdian.skim,
                sdm.nm_sdm AS ketua_pengabdi,
                COALESCE(bidang.nm_bidang_ilmu, 'Tidak Ada') AS bidang_ilmu
            FROM pengabdian
            LEFT JOIN sdm ON sdm.id_sdm = pengabdian.id_sdm
            LEFT JOIN bidang_ilmu AS bidang ON bidang.id_bidang_ilmu = pengabdian.id_bidang_ilmu
            WHERE (
                pengabdian.judul LIKE ?
                OR sdm.nm_sdm LIKE ?
                OR pengabdian.skim LIKE ?
            )
            ORDER BY pengabdian.tahun_usulan DESC
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sister')->select($sql, [
            $limit,
            $searchPattern,
            $searchPattern,
            $searchPattern
        ]);
    }

    /**
     * Search bidang ilmu and return dosen who have that expertise
     * Simplified version - just search dosen by name since map_sdm_bidang is in sister DB
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchBidangIlmu(string $query, int $limit = 10): array
    {
        // For now, just search dosen by name as fallback
        // TODO: Integrate with sister database when bidang ilmu sync is ready
        $sql = "
            SELECT TOP (?)
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                sdm.nidn,
                sdm.nip,
                COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                sms.nm_lemb AS prodi_homebase,
                jenj.nm_jenj_didik AS jenjang_prodi,
                sdm.jk AS jenis_kelamin,
                '' AS bidang_ilmu
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND (
                    sdm.nm_sdm LIKE ?
                    OR sms.nm_lemb LIKE ?
                )
            ORDER BY sdm.nm_sdm
        ";

        $searchPattern = '%' . $query . '%';
        return DB::connection('sqlsrv')->select($sql, [
            $limit,
            $this->unilaIdSp,
            $this->tahunAjaran,
            $searchPattern,
            $searchPattern
        ]);
    }
}
