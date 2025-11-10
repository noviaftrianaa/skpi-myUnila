<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PublikasiDetailRepository
{
    /**
     * Get publikasi basic information
     *
     * @param string $idPublikasi
     * @return object|null
     */
    public function getPublikasiBasicInfo(string $idPublikasi): ?object
    {
        $sql = "
            SELECT
                p.id_publikasi,
                p.judul,
                YEAR(p.tgl_terbit) AS tahun,
                p.tgl_terbit AS tanggal_terbit,
                COALESCE(jp.nm_jns_pub, 'Lainnya') AS jenis_publikasi,
                p.penerbit,
                p.issn,
                p.vol AS volume,
                p.no AS nomor,
                p.hal AS halaman,
                p.url AS url_publikasi,
                p.nama_jurnal,
                p.laman_jurnal,
                p.doi,
                COALESCE(kc.nm_kat_capaian, 'Tidak Ada') AS kategori_capaian,
                l.id_litabmas,
                l.judul_litabmas AS judul_litabmas,
                CASE
                    WHEN l.jns_litabmas = 'L' THEN 'Penelitian'
                    WHEN l.jns_litabmas = 'M' THEN 'Pengabdian'
                    ELSE NULL
                END AS jenis_litabmas
            FROM pdrd.publikasi AS p
            LEFT JOIN ref.jenis_publikasi AS jp
                ON jp.id_jns_pub = p.id_jns_pub
                AND jp.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kc
                ON kc.id_kat_capaian = p.id_kat_capaian
            LEFT JOIN pdrd.litabmas AS l
                ON l.id_litabmas = p.id_litabmas
                AND l.soft_delete = 0
            WHERE p.id_publikasi = ?
                AND p.soft_delete = 0
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$idPublikasi]);
        return !empty($result) ? $result[0] : null;
    }

    /**
     * Get penulis/authors of this publikasi
     *
     * @param string $idPublikasi
     * @return array
     */
    public function getPenulisPublikasi(string $idPublikasi): array
    {
        $sql = "
            WITH PenulisWithProdi AS (
                SELECT
                    tp.id_sdm,
                    sdm.nm_sdm AS nama,
                    sdm.nidn,
                    sdm.nuptk,
                    sdm.jk,
                    tp.peran_tulis,
                    jabfung.nm_jabfung,
                    sms.nm_lemb AS prodi,
                    jenj.nm_jenj_didik AS jenjang,
                    ROW_NUMBER() OVER (
                        PARTITION BY tp.id_sdm
                        ORDER BY
                            CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                            ptk.id_reg_ptk DESC
                    ) AS rn
                FROM pdrd.tulis_pub AS tp
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = tp.id_sdm
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
                WHERE tp.id_publikasi = ?
                    AND tp.soft_delete = 0
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
                    WHEN peran_tulis = 'A' THEN 'Penulis'
                    WHEN peran_tulis = 'B' THEN 'Editor'
                    WHEN peran_tulis = 'C' THEN 'Penerjemah'
                    WHEN peran_tulis = 'D' THEN 'Penemu'
                    ELSE 'Penulis'
                END AS peran
            FROM PenulisWithProdi
            WHERE rn = 1
            ORDER BY nama
        ";

        return DB::connection('sqlsrv')->select($sql, [$idPublikasi]);
    }

    /**
     * Get mahasiswa penulis (if any)
     *
     * @param string $idPublikasi
     * @return array
     */
    public function getMahasiswaPenulis(string $idPublikasi): array
    {
        $sql = "
            WITH MahasiswaWithProdi AS (
                SELECT
                    tp.id_pd,
                    pd.nm_pd AS nama,
                    rpd.nipd AS nim,
                    pd.jk,
                    tp.peran_tulis,
                    sms.nm_lemb AS prodi,
                    jenj.nm_jenj_didik AS jenjang,
                    ROW_NUMBER() OVER (
                        PARTITION BY tp.id_pd
                        ORDER BY
                            CASE WHEN rpd.id_jns_keluar IS NULL THEN 0 ELSE 1 END,
                            rpd.id_reg_pd DESC
                    ) AS rn
                FROM pdrd.tulis_pub AS tp
                INNER JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = tp.id_pd
                    AND pd.soft_delete = 0
                LEFT JOIN pdrd.reg_pd AS rpd
                    ON rpd.id_pd = pd.id_pd
                    AND rpd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms
                    ON sms.id_sms = rpd.id_sms
                    AND sms.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj
                    ON jenj.id_jenj_didik = sms.id_jenj_didik
                    AND jenj.expired_date IS NULL
                WHERE tp.id_publikasi = ?
                    AND tp.soft_delete = 0
                    AND tp.id_pd IS NOT NULL
            )
            SELECT
                id_pd,
                nama,
                nim,
                CASE WHEN jk = 'L' THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis_kelamin,
                COALESCE(prodi, 'Tidak Ada') AS prodi,
                COALESCE(jenjang, 'Tidak Ada') AS jenjang,
                CASE
                    WHEN peran_tulis = 'A' THEN 'Penulis'
                    WHEN peran_tulis = 'B' THEN 'Editor'
                    WHEN peran_tulis = 'C' THEN 'Penerjemah'
                    WHEN peran_tulis = 'D' THEN 'Penemu'
                    ELSE 'Penulis'
                END AS peran
            FROM MahasiswaWithProdi
            WHERE rn = 1
            ORDER BY nama
        ";

        return DB::connection('sqlsrv')->select($sql, [$idPublikasi]);
    }
}
