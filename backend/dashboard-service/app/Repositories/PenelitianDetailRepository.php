<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PenelitianDetailRepository
{
    /**
     * Get penelitian basic information
     *
     * @param string $idLitabmas
     * @return object|null
     */
    public function getPenelitianBasicInfo(string $idLitabmas): ?object
    {
        $sql = "
            SELECT
                l.id_litabmas,
                l.judul_litabmas,
                l.id_thn_kegiatan AS tahun,
                CAST(CAST(l.id_thn_kegiatan AS VARCHAR) + '-01-01' AS DATE) AS tanggal_mulai,
                CAST(CAST(l.id_thn_kegiatan AS VARCHAR) + '-12-31' AS DATE) AS tanggal_selesai,
                COALESCE(l.lama_kegiatan, 0) AS lama_kegiatan,
                COALESCE(l.dana_dikti + l.dana_pt + l.dana_institusi_lain, 0) AS biaya,
                COALESCE(l.dana_dikti, 0) AS dana_dikti,
                COALESCE(l.dana_pt, 0) AS dana_pt,
                COALESCE(l.dana_institusi_lain, 0) AS dana_institusi_lain,
                COALESCE(sk.nm_skim, 'Lainnya') AS skim,
                l.lokasi_kegiatan,
                'Belum diisi' AS bidang_ilmu,
                'Belum diisi' AS sumber_dana,
                NULL AS abstrak,
                NULL AS kata_kunci,
                NULL AS url_penelitian
            FROM pdrd.litabmas AS l
            LEFT JOIN ref.skim_kegiatan AS sk
                ON sk.id_skim = l.id_skim
                AND sk.expired_date IS NULL
            WHERE l.id_litabmas = ?
                AND l.soft_delete = 0
                AND l.jns_litabmas = 'L'
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idLitabmas]);
        return !empty($result) ? $result[0] : null;
    }

    /**
     * Get anggota penelitian (team members)
     *
     * @param string $idLitabmas
     * @return array
     */
    public function getAnggotaPenelitian(string $idLitabmas): array
    {
        $sql = "
            WITH AnggotaWithProdi AS (
                SELECT
                    sal.id_sdm,
                    sdm.nm_sdm AS nama,
                    sdm.nidn,
                    sdm.nip,
                    sdm.jk,
                    sal.peran_litabmas,
                    jabfung.nm_jabfung,
                    sms.nm_lemb AS prodi,
                    jenj.nm_jenj_didik AS jenjang,
                    ROW_NUMBER() OVER (
                        PARTITION BY sal.id_sdm
                        ORDER BY
                            CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                            ptk.id_reg_ptk DESC
                    ) AS rn
                FROM pdrd.sdm_anggota_litabmas AS sal
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = sal.id_sdm
                    AND sdm.soft_delete = 0
                LEFT JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms
                    ON sms.id_sms = ptk.id_sms
                    AND sms.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj
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
                WHERE sal.id_litabmas = ?
                    AND sal.soft_delete = 0
            )
            SELECT
                id_sdm,
                nama,
                nidn,
                nip,
                CASE WHEN jk = 'L' THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis_kelamin,
                COALESCE(nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                COALESCE(prodi, 'Tidak Ada') AS prodi,
                COALESCE(jenjang, 'Tidak Ada') AS jenjang,
                CASE
                    WHEN peran_litabmas = 'K' THEN 'Ketua'
                    WHEN peran_litabmas = 'A' THEN 'Anggota'
                    ELSE 'Anggota'
                END AS peran
            FROM AnggotaWithProdi
            WHERE rn = 1
            ORDER BY
                CASE WHEN peran_litabmas = 'K' THEN 0 ELSE 1 END,
                nama
        ";

        return DB::connection('sqlsrv')->select($sql, [$idLitabmas]);
    }

    /**
     * Get publikasi yang dihasilkan dari penelitian ini
     *
     * @param string $idLitabmas
     * @return array
     */
    public function getPublikasiPenelitian(string $idLitabmas): array
    {
        $sql = "
            SELECT
                p.id_publikasi,
                p.judul,
                YEAR(p.tgl_terbit) AS tahun,
                p.tgl_terbit,
                COALESCE(jp.nm_jns_pub, 'Lainnya') AS jenis_publikasi,
                p.penerbit,
                p.issn,
                p.vol AS volume,
                p.no AS nomor,
                p.hal AS halaman,
                p.url AS url_publikasi
            FROM pdrd.publikasi AS p
            LEFT JOIN ref.jenis_publikasi AS jp
                ON jp.id_jns_pub = p.id_jns_pub
                AND jp.expired_date IS NULL
            WHERE p.id_litabmas = ?
                AND p.soft_delete = 0
            ORDER BY p.tgl_terbit DESC
        ";

        return DB::connection('sqlsrv')->select($sql, [$idLitabmas]);
    }

    /**
     * Get luaran lainnya dari penelitian (HKI, paten, dll)
     *
     * @param string $idLitabmas
     * @return array
     */
    public function getLuaranLainnya(string $idLitabmas): array
    {
        // Table pdrd.luaran_lainnya doesn't exist in the 2022 PDDIKTI schema
        // This will be populated later when data is synced from SISTER API
        return [];
    }

    /**
     * Get mahasiswa yang terlibat dalam penelitian
     *
     * @param string $idLitabmas
     * @return array
     */
    public function getMahasiswaPenelitian(string $idLitabmas): array
    {
        // Table pdrd.mhs_anggota_litabmas doesn't exist in the 2022 PDDIKTI schema
        // This will be populated later when data is synced from SISTER API
        return [];
    }
}
