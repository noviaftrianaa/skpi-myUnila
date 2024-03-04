<?php

namespace App\Models\Pdrd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AktMahasiswa extends Model
{
    protected $table = 'pdrd.akt_mhs';
    protected $primaryKey = 'id_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akt_mhs',
	'id_jns_akt_mhs',
	'id_sms',
	'id_smt',
	'judul_akt_mhs',
	'lokasi_kegiatan',
	'sk_tugas',
	'tgl_sk_tugas',
	'ket_akt',
	'a_komunal',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];

    public static function getRawDataAktivitasMhs($lvl, $id_jns_lemb, $id_organisasi, $thn)
    {
        $filter = '';
        if ($lvl > 3) {
          if ($id_jns_lemb == 23) {
            $filter = " AND fak.id_sms='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 28) {
            $filter = " AND prodi.id_jur_unila='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 24) {
            $filter = " AND prodi.id_sms='" . $id_organisasi . "'";
          }
        }

        $query = "
            SELECT
                reg.id_reg_pd,
                reg.id_pd,
                akt.id_smt,
                reg.nipd,
                pd.nm_pd,
                fak.nm_lemb AS nm_fakultas,
                jur.nm_lemb AS nm_jur,
                CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                smt.nm_smt,
                jns_akt.nm_jns_akt_mhs,
                akt.judul_akt_mhs,
                akt.lokasi_kegiatan
            FROM
                pdrd.anggota_akt_mhs AS ang WITH(NOLOCK)
                JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = ang.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = akt.id_smt
                AND smt.expired_date IS NULL
                AND smt.id_smt = '". $thn ."'
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
                AND jns_akt.expired_date IS NULL
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = ang.id_reg_pd
                AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                AND jur.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
            WHERE
                ang.soft_delete = 0
                " . $filter . "
            ORDER BY
                fak.nm_lemb,
                prodi.nm_lemb ASC
        ";

        return DB::SELECT($query);
    }

    public static function getRawDataMbkm($lvl, $id_jns_lemb, $id_organisasi, $thn)
    {
        $filter = '';
        if ($lvl > 3) {
          if ($id_jns_lemb == 23) {
            $filter = " AND fak.id_sms='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 28) {
            $filter = " AND prodi.id_jur_unila='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 24) {
            $filter = " AND prodi.id_sms='" . $id_organisasi . "'";
          }
        }

        $query = "
            SELECT
                al.*,
                al.total_sks - al.sks_konversi AS sks_reguler
            FROM
                (
                    SELECT
                        reg.id_reg_pd,
                        reg.id_pd,
                        kul.id_smt,
                        smt.nm_smt,
                        reg.nipd,
                        pd.nm_pd,
                        fak.nm_lemb AS nm_fakultas,
                        jur.nm_lemb AS nm_jur,
                        CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                        CASE
                            WHEN mbkm_a.nm_jns_akt_mhs IS NULL THEN mbkm_b.nm_jns_akt_mhs
                            ELSE mbkm_a.nm_jns_akt_mhs
                        END AS nm_jns_akt_mhs,
                        CASE
                            WHEN mbkm_a.judul_akt_mhs IS NULL THEN mbkm_b.judul_akt_mhs
                            ELSE mbkm_a.judul_akt_mhs
                        END AS judul_akt_mhs,
                        CASE
                            WHEN mbkm_a.lokasi_kegiatan IS NULL THEN mbkm_b.lokasi_kegiatan
                            ELSE mbkm_a.lokasi_kegiatan
                        END AS lokasi_kegiatan,
                        FLOOR(reguler.sks_semester) AS total_sks,
                        CASE
                            WHEN mbkm_a.sks_konversi IS NULL THEN mbkm_b.sks_konversi
                            ELSE mbkm_a.sks_konversi
                        END AS sks_konversi
                    FROM
                        pdrd.reg_pd AS reg WITH(NOLOCK)
                        JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
                        AND pd.soft_delete = 0
                        JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                        AND prodi.soft_delete = 0
                        LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                        AND jur.soft_delete = 0
                        JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                        AND fak.soft_delete = 0
                        JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                        AND jenj.expired_date IS NULL
                        JOIN (
                            SELECT
                                kul.id_reg_pd,
                                kul.id_smt
                            FROM
                                pdrd.kuliah_mhs AS kul WITH(NOLOCK)
                            WHERE
                                kul.soft_delete = 0
                                AND kul.id_stat_mhs = 'M'
                                AND kul.id_smt = '". $thn ."'
                        ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
                        LEFT JOIN(
                            SELECT
                                akt_mbkm.id_smt,
                                ang_mbkm.id_reg_pd,
                                jns_akt.nm_jns_akt_mhs,
                                akt_mbkm.judul_akt_mhs,
                                akt_mbkm.lokasi_kegiatan,
                                SUM(k_nilai.sks_mk) AS sks_konversi
                            FROM
                                mbkm.konversi_akt_mhs AS k_nilai
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                AND ang_mbkm.soft_delete = 0
                                JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                AND akt_mbkm.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            WHERE
                                akt_mbkm.id_smt = '". $thn ."'
                                AND akt_mbkm.id_jns_akt_mhs != 21
                                AND k_nilai.soft_delete = 0
                            GROUP BY
                                akt_mbkm.id_smt,
                                ang_mbkm.id_reg_pd,
                                jns_akt.nm_jns_akt_mhs,
                                akt_mbkm.judul_akt_mhs,
                                akt_mbkm.lokasi_kegiatan
                        ) AS mbkm_a ON mbkm_a.id_smt = kul.id_smt
                        AND mbkm_a.id_reg_pd = reg.id_reg_pd
                        LEFT JOIN (
                            SELECT
                                akt_mbkm_tf.id_smt,
                                ang_mbkm_tf.id_reg_pd,
                                jns_akt.nm_jns_akt_mhs,
                                akt_mbkm_tf.judul_akt_mhs,
                                akt_mbkm_tf.lokasi_kegiatan,
                                SUM(k_nilai_tf.sks_diakui) AS sks_konversi
                            FROM
                                mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                                AND mk.soft_delete = 0
                                JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                AND akt_mbkm_tf.soft_delete = 0
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                AND ang_mbkm_tf.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            WHERE
                                k_nilai_tf.id_smt = '". $thn ."'
                                AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                AND k_nilai_tf.soft_delete = 0
                            GROUP BY
                                akt_mbkm_tf.id_smt,
                                ang_mbkm_tf.id_reg_pd,
                                jns_akt.nm_jns_akt_mhs,
                                akt_mbkm_tf.judul_akt_mhs,
                                akt_mbkm_tf.lokasi_kegiatan
                        ) AS mbkm_b ON mbkm_b.id_smt = kul.id_smt
                        AND mbkm_b.id_reg_pd = reg.id_reg_pd
                        LEFT JOIN (
                            SELECT
                                id_smt,
                                id_reg_pd,
                                sks_semester
                            FROM
                                pdrd.kuliah_mhs WITH(NOLOCK)
                            WHERE
                                soft_delete = 0
                                AND id_smt = '". $thn ."'
                            GROUP BY
                                id_reg_pd,
                                id_smt,
                                id_reg_pd,
                                sks_semester
                        ) AS reguler ON reguler.id_smt = kul.id_smt
                        AND reguler.id_reg_pd = reg.id_reg_pd
                        LEFT JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reguler.id_smt
                        AND smt.expired_date IS NULL
                    WHERE
                        reg.soft_delete = 0
                        " . $filter . "
                ) AS al
            ORDER BY
                al.nm_fakultas,
                al.nm_prodi,
                al.nm_pd ASC,
                al.total_sks DESC
        ";

        return DB::SELECT($query);
    }

    public static function getRawDataPrestasi($lvl, $id_jns_lemb, $id_organisasi, $thn)
    {
        $filter = '';
        if ($lvl > 3) {
          if ($id_jns_lemb == 23) {
            $filter = " AND fak.id_sms='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 28) {
            $filter = " AND prodi.id_jur_unila='" . $id_organisasi . "'";
          } elseif ($id_jns_lemb == 24) {
            $filter = " AND prodi.id_sms='" . $id_organisasi . "'";
          }
        }

        $query = "
            SELECT
                reg.id_reg_pd,
                reg.id_pd,
                reg.nipd,
                pd.nm_pd,
                fak.nm_lemb AS nm_fakultas,
                jur.nm_lemb AS nm_jur,
                CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                prestasi.thn_prestasi,
                prestasi.nm_prestasi,
                prestasi.penyelenggara,
                jns_prestasi.nm_jenis_prestasi,
                tkt_prestasi.nm_tkt_prestasi,
                prestasi.peringkat,
                sdm.nm_sdm AS pembimbing
            FROM
                pdrd.prestasi AS prestasi WITH(NOLOCK)
                JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                AND smt.expired_date IS NULL
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = prestasi.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                AND jur.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                LEFT JOIN ref.jenis_prestasi AS jns_prestasi WITH(NOLOCK) ON jns_prestasi.id_jenis_prestasi = prestasi.id_jenis_prestasi
                AND jns_prestasi.expired_date IS NULL
                LEFT JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                AND tkt_prestasi.expired_date IS NULL
                LEFT JOIN pdrd.bimbing_mhs AS bimbing_mhs WITH(NOLOCK) ON bimbing_mhs.id_akt_mhs = akt.id_akt_mhs
                AND bimbing_mhs.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing_mhs.id_sdm
                AND sdm.soft_delete = 0
            WHERE
                prestasi.soft_delete = 0
                AND prestasi.thn_prestasi = '". $thn ."'
                " . $filter . "
            ORDER BY
                fak.nm_lemb,
                prodi.nm_lemb ASC
        ";

        return DB::SELECT($query);
    }
}
