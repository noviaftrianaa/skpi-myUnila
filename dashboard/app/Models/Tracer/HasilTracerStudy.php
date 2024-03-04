<?php

namespace App\Models\Tracer;

use App\Models\AbstractionModel;
use App\Models\Referensi\TahunAjaran;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class HasilTracerStudy extends AbstractionModel
{
    protected $table = 'tracer.hasil_tracer_study';
    protected $primaryKey = 'id_hasil_tracer_study';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_hasil_tracer_study',
        'id_thn_ajaran',
        'id_bid_kerja',
        'id_wil',
        'id_reg_pd',
        'id_smt',
        'id_jns_jalur_kerja',
        'wkt_pengisian',
        'wkt_tunggu',
        'status_lulusan',
        'a_kerja_sblm_lulus',
        'jns_tmpt_bekerja',
        'level_perusahaan',
        'nm_tmpt_bekerja',
        'income_per_bln',
        'status_jabatan',
        'total_instansi_dilamar',
        'hub_bidang_kerja',
        'tkt_kesesuaian',
        'alasan_tidak_sesuai',
        'nm_pt_lnjt',
        'nm_prodi_lnjt',
        'wkt_masuk',
        'ket',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];

    public static function dashboard($tipe, $tahun)
    {
        $tgl      = TahunAjaran::tglSelesai($tahun);
        $from   = "FROM tracer.hasil_tracer_study AS tc WITH (NOLOCK)
        ";
        $group = '';
        $order = '';
        if ($tipe == 'alumni_jk') {
            $select = "
                SELECT
                    SUM(CASE WHEN pd.jk='L' THEN 1 ELSE 0 END) AS 'Laki-laki',
                    SUM(CASE WHEN pd.jk='P' THEN 1 ELSE 0 END) AS 'Perempuan'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'alumni_pendidikan') {
            $select = "
                SELECT
                    SUM(CASE WHEN prodi.id_jenj_didik=20 THEN 1 ELSE 0 END) AS 'D1',
                    SUM(CASE WHEN prodi.id_jenj_didik=21 THEN 1 ELSE 0 END) AS 'D2',
                    SUM(CASE WHEN prodi.id_jenj_didik=22 THEN 1 ELSE 0 END) AS 'D3',
                    SUM(CASE WHEN prodi.id_jenj_didik=23 THEN 1 ELSE 0 END) AS 'D4',
                    SUM(CASE WHEN prodi.id_jenj_didik=25 THEN 1 ELSE 0 END) AS 'Profesi',
                    SUM(CASE WHEN prodi.id_jenj_didik=30 THEN 1 ELSE 0 END) AS 'S1',
                    SUM(CASE WHEN prodi.id_jenj_didik=31 THEN 1 ELSE 0 END) AS 'Profesi',
                    SUM(CASE WHEN prodi.id_jenj_didik=32 THEN 1 ELSE 0 END) AS 'Sp-1',
                    SUM(CASE WHEN prodi.id_jenj_didik=35 THEN 1 ELSE 0 END) AS 'S2',
                    SUM(CASE WHEN prodi.id_jenj_didik=36 THEN 1 ELSE 0 END) AS 'S2 Terapan',
                    SUM(CASE WHEN prodi.id_jenj_didik=37 THEN 1 ELSE 0 END) AS 'Sp-2',
                    SUM(CASE WHEN prodi.id_jenj_didik=40 THEN 1 ELSE 0 END) AS 'S3',
                    SUM(CASE WHEN prodi.id_jenj_didik=41 THEN 1 ELSE 0 END) AS 'S3 Terapan',
                    SUM(CASE WHEN prodi.id_jenj_didik IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Kualifikasi Pendidikan'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'status_lulusan') {
            $select = "
                SELECT
                    SUM(CASE WHEN tc.status_lulusan=1 THEN 1 ELSE 0 END) AS 'Bekerja',
                    SUM(CASE WHEN tc.status_lulusan=2 THEN 1 ELSE 0 END) AS 'Berwirausaha',
                    SUM(CASE WHEN tc.status_lulusan=3 THEN 1 ELSE 0 END) AS 'Melanjutkan Studi',
                    SUM(CASE WHEN tc.status_lulusan=0 THEN 1 ELSE 0 END) AS 'Tidak bekerja'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'tingkat_perusahaan') {
            $select = "
                SELECT
                    SUM(CASE WHEN tc.level_perusahaan='Perusahaan Lokal' THEN 1 ELSE 0 END) AS 'Perusahaan Lokal',
                    SUM(CASE WHEN tc.level_perusahaan='Perusahaan Nasional' THEN 1 ELSE 0 END) AS 'Perusahaan Nasional',
                    SUM(CASE WHEN tc.level_perusahaan='Perusahaan Regional' THEN 1 ELSE 0 END) AS 'Perusahaan Regional',
                    SUM(CASE WHEN tc.level_perusahaan='Perusahaan Multinasional' THEN 1 ELSE 0 END) AS 'Perusahaan Multinasional'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'bidang_kerja') {
            $select = "
                SELECT
                    SUM(CASE WHEN tc.id_bid_kerja = 1 THEN 1 ELSE 0 END) AS 'Kegiatan Badan Internasional dan Badan Ekstra Internasional',
                    SUM(CASE WHEN tc.id_bid_kerja = 2 THEN 1 ELSE 0 END) AS 'Pengadaan air, Pengelolaan Sampah dan Daur Ulang, Pembuangan dan Pembersihan Limbah dan Sampah',
                    SUM(CASE WHEN tc.id_bid_kerja = 3 THEN 1 ELSE 0 END) AS 'Pertambangan dan Penggalian',
                    SUM(CASE WHEN tc.id_bid_kerja = 4 THEN 1 ELSE 0 END) AS 'Jasa Perorangan yang Melayani Rumah Tangga',
                    SUM(CASE WHEN tc.id_bid_kerja = 5 THEN 1 ELSE 0 END) AS 'Jasa Profesional, Ilmiah dan Teknis',
                    SUM(CASE WHEN tc.id_bid_kerja = 6 THEN 1 ELSE 0 END) AS 'Kebudayaan, Hiburan dan Rekreasi',
                    SUM(CASE WHEN tc.id_bid_kerja = 7 THEN 1 ELSE 0 END) AS 'Jasa Persewaan, Ketenagakerjaan, Agen Perjalanan dan Penunjang Usaha Lainnya',
                    SUM(CASE WHEN tc.id_bid_kerja = 8 THEN 1 ELSE 0 END) AS 'Real Estat',
                    SUM(CASE WHEN tc.id_bid_kerja = 9 THEN 1 ELSE 0 END) AS 'Transportasi dan Pergudangan',
                    SUM(CASE WHEN tc.id_bid_kerja = 10 THEN 1 ELSE 0 END) AS 'Informasi dan Komunikasi',
                    SUM(CASE WHEN tc.id_bid_kerja = 11 THEN 1 ELSE 0 END) AS 'Pengadaan Listrik, Gas, Uap/Air Panas dan Udara Dingin',
                    SUM(CASE WHEN tc.id_bid_kerja = 12 THEN 1 ELSE 0 END) AS 'Industri Pengolahan',
                    SUM(CASE WHEN tc.id_bid_kerja = 13 THEN 1 ELSE 0 END) AS 'Penyediaan Akomodasi dan Penyediaan Makan Minum',
                    SUM(CASE WHEN tc.id_bid_kerja = 14 THEN 1 ELSE 0 END) AS 'Administrasi Pemerintahan, Pertahanan dan Jaminan Sosial Wajib',
                    SUM(CASE WHEN tc.id_bid_kerja = 15 THEN 1 ELSE 0 END) AS 'Kegiatan Jasa Lainnya',
                    SUM(CASE WHEN tc.id_bid_kerja = 16 THEN 1 ELSE 0 END) AS 'Pertanian, Kehutanan dan Perikanan',
                    SUM(CASE WHEN tc.id_bid_kerja = 17 THEN 1 ELSE 0 END) AS 'Jasa Kesehatan dan Kegiatan Sosial',
                    SUM(CASE WHEN tc.id_bid_kerja = 18 THEN 1 ELSE 0 END) AS 'Konstruksi',
                    SUM(CASE WHEN tc.id_bid_kerja = 19 THEN 1 ELSE 0 END) AS 'Perdagangan Besar dan Eceran',
                    SUM(CASE WHEN tc.id_bid_kerja = 20 THEN 1 ELSE 0 END) AS 'Jasa Keuangan dan Asuransi',
                    SUM(CASE WHEN tc.id_bid_kerja = 21 THEN 1 ELSE 0 END) AS 'Jasa Pendidikan'
                ";
            $alternative_where = '';
        }
        $join = "
            JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc.id_reg_pd
            AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
            AND pd.soft_delete = 0
            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
            AND prodi.soft_delete = 0
            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
            AND fak.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = prodi.id_jenj_didik
            AND jenjang.expired_date IS NULL
            LEFT JOIN ref.bidang_pekerjaan AS bdg_kerja WITH(NOLOCK) ON bdg_kerja.id_bid_kerja = tc.id_bid_kerja
            AND bdg_kerja.expired_date IS NULL
            LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc.id_wil
            AND wil.expired_date IS NULL
            LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = wil.id_wil
            AND umr.id_tahun_anggaran = tc.id_thn_ajaran
            AND umr.soft_delete = 0
                ";

        $where = "
                WHERE
                    tc.soft_delete=0
                    AND YEAR(reg.tgl_sk_yudisium) = '" . $tahun . "'
                ";
        $data = \DB::SELECT($select . $from . $join . $where . $alternative_where . $group . $order);
        return collect($data);
    }

    public static function getRawData($lvl, $id_jns_lemb, $id_organisasi, $thn)
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
                YEAR(reg.tgl_keluar) AS tahun_lulus,
                tc.wkt_pengisian,
                reg.nipd,
                pd.nm_pd,
                fak.nm_lemb AS nm_fakultas,
                jur.nm_lemb AS nm_jur,
                CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                reg.tgl_keluar,
                reg.tgl_sk_yudisium,
                    CASE
                    WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                    WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                    WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                    WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                    ELSE 'Belum Mengisi'
                END AS status_lulusan,
                CASE
                    WHEN tc.a_kerja_sblm_lulus = 1 THEN 'Ya'
                    ELSE 'Tidak'
                END AS a_kerja_sblm_lulus,
                CONCAT(tc.wkt_tunggu, ' Bulan') bln_dpt_kerja,
                format(tc.income_per_bln, 'N') AS income_per_bln,
                provinsi.nm_wil,
                tc.nm_tmpt_bekerja,
                CASE
                    WHEN tc.status_lulusan IN (1, 2) THEN FORMAT(1.2 * umr.besaran_umr, 'N')
                    ELSE NULL
                END AS ump,
                CASE
                    WHEN tc.wkt_masuk IS NOT NULL THEN 1
                    ELSE 0
                END AS a_lnjut_study,
                tc.wkt_masuk AS wkt_masuk_lnjt_study,
            CASE
                WHEN tc.status_lulusan = 3 THEN CONCAT(
                    DATEDIFF(MONTH, reg.tgl_keluar, tc.wkt_masuk),
                    ' Bulan'
                )
                ELSE NULL
            END AS jarak_wkt_masuk_lnjt_study,
                tc.nm_pt_lnjt,
                tc.nm_prodi_lnjt,
                tc.ket
            FROM
                tracer.hasil_tracer_study AS tc
                LEFT JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = tc.id_reg_pd
                AND reg.id_jns_keluar = '1'
                AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur ON jur.id_sms = prodi.id_jur_unila
                AND jur.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = YEAR(reg.tgl_keluar) + 1
                AND umr.soft_delete = 0
                LEFT JOIN ref.wilayah AS provinsi ON provinsi.id_wil = umr.id_wil
                AND provinsi.id_level_wil = 1
                AND provinsi.expired_date IS NULL
            WHERE
                tc.soft_delete = 0
                AND YEAR(reg.tgl_keluar) = '" . $thn . "'
                " . $filter . "
            ORDER BY
                fak.nm_lemb, prodi.nm_lemb, jenj.nm_jenj_didik, pd.nm_pd ASC
        ";

        return DB::SELECT($query);
    }
}
