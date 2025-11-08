<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DosenProfileRepository
{
    /**
     * Get dosen profile by ID
     */
    public function getDosenProfile(string $idSdm)
    {
        try {
            // Use same approach as ProgramStudiRepository - get dosen with homebase info
            $profile = DB::connection('sqlsrv')->selectOne("
                SELECT
                    sdm.id_sdm,
                    sdm.nm_sdm,
                    sdm.nidn,
                    sdm.nip,
                    sdm.email,
                    sdm.jk AS jenis_kelamin,
                    -- Get first homebase from reg_ptk with fakultas, jurusan, prodi
                    (SELECT TOP 1 fak.nm_lemb
                        FROM pdrd.reg_ptk AS ptk
                        INNER JOIN pdrd.sms AS sms
                            ON sms.id_sms = ptk.id_sms
                            AND sms.soft_delete = 0
                        LEFT JOIN pdrd.sms AS fak
                            ON fak.id_sms = sms.id_fak_unila
                            AND fak.soft_delete = 0
                        WHERE ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                    ) AS homebase_fakultas,
                    (SELECT TOP 1 jur.nm_lemb
                        FROM pdrd.reg_ptk AS ptk
                        INNER JOIN pdrd.sms AS sms
                            ON sms.id_sms = ptk.id_sms
                            AND sms.soft_delete = 0
                        LEFT JOIN pdrd.sms AS jur
                            ON jur.id_sms = sms.id_jur_unila
                            AND jur.soft_delete = 0
                        WHERE ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                    ) AS homebase_jurusan,
                    (SELECT TOP 1 sms.nm_lemb
                        FROM pdrd.reg_ptk AS ptk
                        INNER JOIN pdrd.sms AS sms
                            ON sms.id_sms = ptk.id_sms
                            AND sms.soft_delete = 0
                        WHERE ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                    ) AS homebase_prodi,
                    (SELECT TOP 1 jenjang.nm_jenj_didik
                        FROM pdrd.reg_ptk AS ptk
                        INNER JOIN pdrd.sms AS sms
                            ON sms.id_sms = ptk.id_sms
                            AND sms.soft_delete = 0
                        INNER JOIN ref.jenjang_pendidikan AS jenjang
                            ON jenjang.id_jenj_didik = sms.id_jenj_didik
                            AND jenjang.expired_date IS NULL
                        WHERE ptk.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                    ) AS homebase_jenjang
                FROM pdrd.sdm AS sdm
                WHERE sdm.id_sdm = ?
                    AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = 12
            ", [$idSdm]);

            return $profile;
        } catch (\Exception $e) {
            Log::error('Error fetching dosen profile: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get gelar akademik dosen (ordered by jenjang level)
     */
    public function getGelarAkademik(string $idSdm)
    {
        try {
            $gelar = DB::connection('sqlsrv')->select("
                SELECT DISTINCT
                    ga.singkat_gelar,
                    ga.posisi_gelar,
                    rpf.thn_lulus
                FROM pdrd.rwy_pend_formal AS rpf
                JOIN ref.gelar_akademik AS ga
                    ON ga.id_gelar_akad = rpf.id_gelar_akad
                    AND ga.expired_date IS NULL
                WHERE rpf.id_sdm = ?
                    AND rpf.soft_delete = 0
                    AND rpf.thn_lulus IS NOT NULL
                ORDER BY rpf.thn_lulus ASC, ga.posisi_gelar ASC
            ", [$idSdm]);

            return $gelar;
        } catch (\Exception $e) {
            Log::error('Error fetching gelar akademik: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat pendidikan dosen
     */
    public function getRiwayatPendidikan(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    jenj.nm_jenj_didik AS jenjang,
                    rpf.nm_sp_formal AS program_studi,
                    rpf.nm_sp_formal AS universitas,
                    rpf.thn_lulus AS tahun_lulus,
                    ga.singkat_gelar AS gelar,
                    bs.nm_bid_studi AS bidang_studi,
                    rpf.judul_tesis AS judul_tesis
                FROM pdrd.rwy_pend_formal AS rpf
                LEFT JOIN ref.jenjang_pendidikan AS jenj
                    ON jenj.id_jenj_didik = rpf.id_jenj_didik
                    AND jenj.expired_date IS NULL
                LEFT JOIN ref.gelar_akademik AS ga
                    ON ga.id_gelar_akad = rpf.id_gelar_akad
                    AND ga.expired_date IS NULL
                LEFT JOIN ref.bidang_studi AS bs
                    ON bs.id_bid_studi = rpf.id_bid_studi
                    AND bs.expired_date IS NULL
                WHERE rpf.id_sdm = ?
                    AND rpf.soft_delete = 0
                    AND rpf.thn_lulus IS NOT NULL
                ORDER BY rpf.thn_lulus DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat pendidikan: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat pengajaran dosen
     */
    public function getRiwayatPengajaran(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT DISTINCT
                    smt.nm_smt AS tahun_ajaran,
                    COALESCE(mk.nm_mk, kk.nm_kls) AS mata_kuliah,
                    sms.nm_lemb AS program_studi,
                    kk.sks_mk AS sks
                FROM pdrd.akt_ajar_dosen AS ad
                INNER JOIN pdrd.reg_ptk AS ptk
                    ON ptk.id_reg_ptk = ad.id_reg_ptk
                    AND ptk.soft_delete = 0
                INNER JOIN pdrd.kelas_kuliah AS kk
                    ON kk.id_kls = ad.id_kls
                    AND kk.soft_delete = 0
                LEFT JOIN pdrd.matkul AS mk
                    ON mk.id_mk = kk.id_mk
                    AND mk.soft_delete = 0
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = kk.id_sms
                    AND sms.soft_delete = 0
                INNER JOIN ref.semester AS smt
                    ON smt.id_smt = kk.id_smt
                WHERE ptk.id_sdm = ?
                    AND ad.soft_delete = 0
                ORDER BY smt.nm_smt DESC, COALESCE(mk.nm_mk, kk.nm_kls) ASC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat pengajaran: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get penelitian & pengabdian dosen
     */
    public function getPenelitianPengabdian(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    lit.judul_litabmas AS judul,
                    CASE
                        WHEN lit.jns_litabmas = 'L' THEN 'Penelitian'
                        WHEN lit.jns_litabmas = 'M' THEN 'Pengabdian'
                        ELSE 'Lainnya'
                    END AS jenis,
                    lit.id_thn_kegiatan AS tahun,
                    skim.nm_skim AS skema,
                    CASE
                        WHEN lit.stat_aktif = 1 THEN 'Berjalan'
                        ELSE 'Selesai'
                    END AS status
                FROM pdrd.sdm_anggota_litabmas AS anggota
                INNER JOIN pdrd.litabmas AS lit
                    ON lit.id_litabmas = anggota.id_litabmas
                    AND lit.soft_delete = 0
                LEFT JOIN ref.skim_kegiatan AS skim
                    ON skim.id_skim = lit.id_skim
                WHERE anggota.id_sdm = ?
                    AND anggota.soft_delete = 0
                    AND lit.id_thn_kegiatan IS NOT NULL
                ORDER BY lit.id_thn_kegiatan DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching penelitian & pengabdian: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get publikasi jurnal dosen
     * id_jns_pub: 21 (Jurnal nasional), 22 (Jurnal nasional terakreditasi),
     *             23 (Jurnal internasional), 24 (Jurnal internasional bereputasi)
     */
    public function getPublikasiJurnal(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    pub.judul,
                    YEAR(pub.tgl_terbit) AS tahun,
                    pub.nama_jurnal,
                    pub.issn,
                    jp.nm_jns_pub AS jenis_jurnal,
                    CASE
                        WHEN pub.quartile = 1 THEN 'Q1'
                        WHEN pub.quartile = 2 THEN 'Q2'
                        WHEN pub.quartile = 3 THEN 'Q3'
                        WHEN pub.quartile = 4 THEN 'Q4'
                        ELSE '-'
                    END AS quartile
                FROM pdrd.tulis_pub AS tulis
                INNER JOIN pdrd.publikasi AS pub
                    ON pub.id_publikasi = tulis.id_publikasi
                    AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jp
                    ON jp.id_jns_pub = pub.id_jns_pub
                WHERE tulis.id_sdm = ?
                    AND tulis.soft_delete = 0
                    AND pub.id_jns_pub IN (21, 22, 23, 24)
                    AND pub.tgl_terbit IS NOT NULL
                ORDER BY pub.tgl_terbit DESC, pub.judul ASC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching publikasi jurnal: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get HaKI dosen
     * id_jns_pub: 41 (Paten), 42 (Paten sederhana), 43 (Hak cipta), 44 (Merek dagang)
     */
    public function getHaki(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    pub.judul,
                    YEAR(pub.tgl_terbit) AS tahun,
                    jp.nm_jns_pub AS jenis,
                    pub.no_paten AS nomor_pendaftaran
                FROM pdrd.tulis_pub AS tulis
                INNER JOIN pdrd.publikasi AS pub
                    ON pub.id_publikasi = tulis.id_publikasi
                    AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jp
                    ON jp.id_jns_pub = pub.id_jns_pub
                WHERE tulis.id_sdm = ?
                    AND tulis.soft_delete = 0
                    AND pub.id_jns_pub IN (41, 42, 43, 44)
                    AND pub.tgl_terbit IS NOT NULL
                ORDER BY pub.tgl_terbit DESC, pub.judul ASC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching HaKI: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get publikasi buku dosen
     * id_jns_pub: 11 (Monograf), 12 (Buku referensi), 13 (Buku lainnya),
     *             14 (Book chapter nasional), 15 (Book chapter internasional)
     */
    public function getBuku(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    pub.judul,
                    YEAR(pub.tgl_terbit) AS tahun,
                    pub.penerbit,
                    pub.isbn,
                    jp.nm_jns_pub AS jenis_buku
                FROM pdrd.tulis_pub AS tulis
                INNER JOIN pdrd.publikasi AS pub
                    ON pub.id_publikasi = tulis.id_publikasi
                    AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jp
                    ON jp.id_jns_pub = pub.id_jns_pub
                WHERE tulis.id_sdm = ?
                    AND tulis.soft_delete = 0
                    AND pub.id_jns_pub IN (11, 12, 13, 14, 15)
                    AND pub.tgl_terbit IS NOT NULL
                ORDER BY pub.tgl_terbit DESC, pub.judul ASC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching buku: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get prosiding dosen
     * id_jns_pub: 31 (Prosiding seminar nasional), 32 (Prosiding seminar internasional)
     */
    public function getProsiding(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    pub.judul,
                    YEAR(pub.tgl_terbit) AS tahun,
                    pub.nama_pertemuan AS nama_seminar,
                    jp.nm_jns_pub AS jenis_prosiding
                FROM pdrd.tulis_pub AS tulis
                INNER JOIN pdrd.publikasi AS pub
                    ON pub.id_publikasi = tulis.id_publikasi
                    AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jp
                    ON jp.id_jns_pub = pub.id_jns_pub
                WHERE tulis.id_sdm = ?
                    AND tulis.soft_delete = 0
                    AND pub.id_jns_pub IN (31, 32)
                    AND pub.tgl_terbit IS NOT NULL
                ORDER BY pub.tgl_terbit DESC, pub.judul ASC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching prosiding: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat jabatan fungsional dosen
     */
    public function getRiwayatFungsional(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    jab.nm_jabfung AS jabatan,
                    rf.tmt_sk_jabfung AS tmt,
                    rf.sk_jabfung AS no_sk,
                    rf.tmt_sk_jabfung AS tgl_sk
                FROM pdrd.rwy_fungsional AS rf
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rf.id_jabfung
                WHERE rf.id_sdm = ?
                    AND rf.soft_delete = 0
                    AND rf.tmt_sk_jabfung IS NOT NULL
                ORDER BY rf.tmt_sk_jabfung DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat fungsional: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat jabatan struktural dosen
     */
    public function getRiwayatStruktural(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    jt.nm_jab_tgs AS jabatan,
                    kk.nm_kat AS deskripsi,
                    rs.tmt_sk_jabstruk AS tmt,
                    rs.sk_jabstruk AS no_sk,
                    rs.tmt_sk_jabstruk AS tgl_sk
                FROM pdrd.rwy_struktural AS rs
                LEFT JOIN ref.jab_tgs AS jt
                    ON jt.id_jab_tgs = rs.id_jab_tgs
                LEFT JOIN ref.kategori_kegiatan AS kk
                    ON kk.id_katgiat = rs.id_katgiat
                WHERE rs.id_sdm = ?
                    AND rs.soft_delete = 0
                    AND rs.tmt_sk_jabstruk IS NOT NULL
                ORDER BY rs.tmt_sk_jabstruk DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat struktural: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat kepangkatan dosen
     */
    public function getRiwayatKepangkatan(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    CONCAT(pang.nm_pangkat, ' (', pang.kode_gol, ')') AS pangkat,
                    rk.tmt_sk_pangkat AS tmt,
                    rk.sk_pangkat AS no_sk,
                    rk.tgl_sk_pangkat AS tgl_sk
                FROM pdrd.rwy_kepangkatan AS rk
                LEFT JOIN ref.pangkat_golongan AS pang
                    ON pang.id_pangkat_gol = rk.id_pangkat_gol
                WHERE rk.id_sdm = ?
                    AND rk.soft_delete = 0
                    AND rk.tmt_sk_pangkat IS NOT NULL
                ORDER BY rk.tmt_sk_pangkat DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat kepangkatan: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get tugas tambahan dosen (non-struktural)
     */
    public function getTugasTambahan(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    jt.nm_jab_tgs AS jabatan,
                    kk.nm_kat AS deskripsi,
                    tt.tmt_sk_tambah AS tmt,
                    tt.sk_tugas_tambah AS no_sk,
                    tt.tst_sk_tambah AS tgl_sk
                FROM pdrd.tugas_tambahan AS tt
                LEFT JOIN ref.jab_tgs AS jt
                    ON jt.id_jab_tgs = tt.id_jab_tgs
                LEFT JOIN ref.kategori_kegiatan AS kk
                    ON kk.id_katgiat = tt.id_katgiat
                WHERE tt.id_sdm = ?
                    AND tt.soft_delete = 0
                    AND tt.tmt_sk_tambah IS NOT NULL
                ORDER BY tt.tmt_sk_tambah DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching tugas tambahan: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get riwayat sertifikasi dosen
     */
    public function getRiwayatSertifikasi(string $idSdm)
    {
        try {
            return DB::connection('sqlsrv')->select("
                SELECT
                    js.nm_jns_sert AS jenjang_sertifikasi,
                    bid.nm_bid_studi AS bidang_studi,
                    rs.sk_sert AS no_sertifikat,
                    rs.nrg AS no_registrasi,
                    rs.thn_sert AS tahun
                FROM pdrd.rwy_sertifikasi AS rs
                LEFT JOIN ref.jenis_sert AS js
                    ON js.id_jns_sert = rs.id_jns_sert
                LEFT JOIN ref.bidang_studi AS bid
                    ON bid.id_bid_studi = rs.id_bid_studi
                WHERE rs.id_sdm = ?
                    AND rs.soft_delete = 0
                    AND rs.thn_sert IS NOT NULL
                ORDER BY rs.thn_sert DESC
            ", [$idSdm]);
        } catch (\Exception $e) {
            Log::error('Error fetching riwayat sertifikasi: ' . $e->getMessage());
            return [];
        }
    }
}
