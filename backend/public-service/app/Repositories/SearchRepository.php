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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
                pd.id_pd,
                pd.nm_pd AS nama,
                reg.nipd AS nim,
                sms.nm_lemb AS prodi,
                jenj.nm_jenj_didik AS jenjang,
                CASE
                    WHEN CAST(reg.id_jns_keluar AS VARCHAR(10)) = '1' THEN 'Lulus'
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
                AND sms.id_sp = '{$this->unilaIdSp}'
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN pdrd.kuliah_mhs AS kmh
                ON kmh.id_reg_pd = reg.id_reg_pd
                AND kmh.soft_delete = 0
                AND kmh.id_smt = (
                    SELECT TOP 1 CAST(id_smt AS VARCHAR(10))
                    FROM ref.semester
                    WHERE expired_date IS NULL
                    AND a_periode_aktif = 1
                    ORDER BY id_smt DESC
                )
            WHERE pd.soft_delete = 0
                AND (
                    pd.nm_pd LIKE '%{$escapedQuery}%'
                    OR reg.nipd LIKE '%{$escapedQuery}%'
                    OR sms.nm_lemb LIKE '%{$escapedQuery}%'
                )
            ORDER BY pd.nm_pd
        ";

        return DB::connection('sqlsrv')->select($sql);
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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                sdm.nidn,
                sdm.nuptk,
                COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                sms.nm_lemb AS prodi_homebase,
                jenj.nm_jenj_didik AS jenjang_prodi,
                sdm.jk AS jenis_kelamin
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_sp = '{$this->unilaIdSp}'
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '{$this->tahunAjaran}'
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
                    sdm.nm_sdm LIKE '%{$escapedQuery}%'
                    OR sdm.nidn LIKE '%{$escapedQuery}%'
                    OR sdm.nuptk LIKE '%{$escapedQuery}%'
                    OR sms.nm_lemb LIKE '%{$escapedQuery}%'
                )
            ORDER BY sdm.nm_sdm
        ";

        return DB::connection('sqlsrv')->select($sql);
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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
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
            -- Status aktif ditentukan oleh kuliah_mhs.id_stat_mhs (per semester)
            LEFT JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            WHERE sms.soft_delete = 0
                AND sms.id_sp = '{$this->unilaIdSp}'
                AND sms.id_jns_sms = '3'
                AND sms.stat_prodi = 'A'
                AND sms.id_fak_unila IS NOT NULL
                AND (
                    sms.nm_lemb LIKE '%{$escapedQuery}%'
                    OR sms.kode_prodi LIKE '%{$escapedQuery}%'
                    OR jenj.nm_jenj_didik LIKE '%{$escapedQuery}%'
                )
            GROUP BY
                sms.id_sms,
                sms.nm_lemb,
                jenj.nm_jenj_didik,
                sms.kode_prodi,
                sms.stat_prodi
            ORDER BY sms.nm_lemb
        ";

        return DB::connection('sqlsrv')->select($sql);
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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
                l.id_litabmas AS id_penelitian,
                l.judul_litabmas AS judul,
                l.id_thn_kegiatan AS tahun,
                COALESCE(sk.nm_skim, 'Lainnya') AS skim,
                '' AS ketua_peneliti,
                'Tidak Ada' AS bidang_ilmu
            FROM pdrd.litabmas AS l
            LEFT JOIN ref.skim_kegiatan AS sk
                ON sk.id_skim = l.id_skim
                AND sk.expired_date IS NULL
            WHERE l.soft_delete = 0
                AND l.jns_litabmas = 'L'
                AND (
                    l.judul_litabmas LIKE '%{$escapedQuery}%'
                    OR sk.nm_skim LIKE '%{$escapedQuery}%'
                )
            ORDER BY l.id_thn_kegiatan DESC
        ";

        return DB::connection('sqlsrv')->select($sql);
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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
                p.id_publikasi,
                p.judul,
                YEAR(p.tgl_terbit) AS tahun,
                COALESCE(jp.nm_jns_pub, 'Lainnya') AS jenis_publikasi,
                p.penerbit,
                '' AS penulis_utama
            FROM pdrd.publikasi AS p
            LEFT JOIN ref.jenis_publikasi AS jp
                ON jp.id_jns_pub = p.id_jns_pub
                AND jp.expired_date IS NULL
            WHERE p.soft_delete = 0
                AND (
                    p.judul LIKE '%{$escapedQuery}%'
                    OR p.penerbit LIKE '%{$escapedQuery}%'
                )
            ORDER BY p.tgl_terbit DESC
        ";

        return DB::connection('sqlsrv')->select($sql);
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
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        $sql = "
            SELECT TOP ({$limit})
                l.id_litabmas AS id_pengabdian,
                l.judul_litabmas AS judul,
                l.id_thn_kegiatan AS tahun,
                COALESCE(sk.nm_skim, 'Lainnya') AS skim,
                '' AS ketua_pengabdi,
                'Tidak Ada' AS bidang_ilmu
            FROM pdrd.litabmas AS l
            LEFT JOIN ref.skim_kegiatan AS sk
                ON sk.id_skim = l.id_skim
                AND sk.expired_date IS NULL
            WHERE l.soft_delete = 0
                AND l.jns_litabmas = 'M'
                AND (
                    l.judul_litabmas LIKE '%{$escapedQuery}%'
                    OR sk.nm_skim LIKE '%{$escapedQuery}%'
                )
            ORDER BY l.id_thn_kegiatan DESC
        ";

        return DB::connection('sqlsrv')->select($sql);
    }

    /**
     * Search bidang ilmu - returns list of bidang ilmu categories with dosen count
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchBidangIlmu(string $query, int $limit = 10): array
    {
        // Escape single quotes for SQL Server
        $escapedQuery = str_replace("'", "''", $query);

        // Search bidang ilmu from sister database
        $sql = "
            SELECT TOP ({$limit})
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang,
                COUNT(DISTINCT msb.id_sdm) AS total_dosen
            FROM ref.kelompok_bidang AS kb
            LEFT JOIN pdrd.map_sdm_bidang AS msb
                ON msb.id_kel_bidang = kb.id_kel_bidang
                AND msb.soft_delete = 0
            WHERE kb.expired_date IS NULL
                AND kb.nm_kel_bidang LIKE '%{$escapedQuery}%'
            GROUP BY
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang
            ORDER BY COUNT(DISTINCT msb.id_sdm) DESC, kb.nm_kel_bidang ASC
        ";

        return DB::connection('sister')->select($sql);
    }
}
