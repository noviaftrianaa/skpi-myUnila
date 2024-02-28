<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use App\Models\Referensi\Semester;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SMS extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.sms';
    protected $primaryKey = 'id_sms';

  protected $fillable = [
    'id_sms',
    'id_fak_unila',
    'id_jur_unila',
    'id_jur',
    'id_jenj_didik',
    'nm_lemb',
    'kd_kl',
    'kd_satker',
    'smt_mulai',
    'a_selenggara_subst',
    'stat_prodi_unila',
    'kode_prodi',
    'nm_prodi_english',
    'kpst_pd',
    'sks_lulus',
    'gelar_lulusan',
    'stat_prodi',
    'polesei_nilai',
    'a_kependidikan',
    'jln',
    'rt',
    'rw',
    'nm_dsn',
    'ds_kel',
    'kode_pos',
    'lintang',
    'bujur',
    'no_tel',
    'no_fax',
    'email',
    'website',
    'singkatan',
    'tgl_berdiri',
    'sk_selenggara',
    'tgl_sk_selenggara',
    'tmt_sk_selenggara',
    'tst_sk_selenggara',
    'sistem_ajar',
    'a_pjj',
    'a_psdku',
    'luas_lab',
    'kapasitas_prak_satu_shift',
    'jml_mhs_pengguna',
    'jml_jam_penggunaan',
    'jml_prodi_pengguna',
    'jml_modul_prak_sendiri',
    'jml_modul_prak_lain',
    'fungsi_selain_prak',
    'penggunaan_lab',
    'a_pkl',
    'id_sp',
    'id_jns_sms',
    'id_fungsi_lab',
    'id_kel_usaha',
    'id_blob',
    'id_wil',
    'id_induk_sms',
    'create_date',
    'id_creator',
    'last_update',
    'id_updater',
    'soft_delete',
    'last_sync',
  ];

    public $timestamps = false;
    public $incrementing = false;

    public function jenjang()
    {
      return $this->belongsTo('App\Models\Referensi\JenjangPendidikan', 'id_jenj_didik', 'id_jenj_didik');
    }
    public function smt()
    {
      return $this->belongsTo('App\Models\Referensi\Semester', 'smt_mulai', 'id_smt');
    }

    public function jurusan_unila()
    {
      return $this->belongsTo('App\Models\Pdrd\SMS','id_jur_unila','id_sms');
    }

    public function fakultas_unila()
    {
      return $this->belongsTo('App\Models\Pdrd\SMS','id_fak_unila','id_sms');
    }

    public static function dashboard_tabel_list_sms($id_sms,$id_smt)
    {
        $thn_ajaran = Semester::find($id_smt)->id_thn_ajaran;
        $condition = '';
        if (count($id_sms)>0) {
            $condition.=" AND tsms.id_sms IN ('".implode("','",$id_sms)."')";
        }
        $query = "
            SELECT tsms.id_sms, tfak.nm_lemb AS nm_fak, tsms.nm_lemb, tj.nm_jenj_didik, tsms.stat_prodi,
                SUM(CASE WHEN LEFT(tsdm.nidn,2) < '88' THEN 1 ELSE 0 END) AS total_dosen_nidn,
                SUM(CASE WHEN LEFT(tsdm.nidn,2) IN ('88','89') THEN 1 ELSE 0 END) AS total_dosen_nidk,
                SUM(CASE WHEN LEFT(tsdm.nidn,2) = '99' THEN 1 ELSE 0 END) AS total_dosen_nup,
                COUNT(tsdm.id_sdm) AS total_dosen_homebase,
                snh.total_dosen_rasio,
                pd.mhs_aktif, pd.mhs_non_aktif, pd.mhs_do, pd.mhs_cuti, pd.mhs_keluar, pd.mhs_mbkm, pd.mhs_lulus, pd.mhs_indonesia, pd.mhs_asing, pd.total_mhs
            FROM pdrd.sdm AS tsdm
            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL
            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.soft_delete=0
             AND ta.a_sp_homebase=1 AND ta.id_thn_ajaran=".$thn_ajaran."
            JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp=tr.id_sp AND tsp.id_sp='".env('APP_ID_SP')."'
            JOIN pdrd.sms AS tsms ON tsms.id_sms=tr.id_sms
            LEFT JOIN pdrd.sms AS tfak ON tfak.id_sms=tsms.id_fak_unila
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            JOIN (
                SELECT
                    trpd.id_sms,
                    SUM(CASE WHEN (akm.id_stat_mhs='L' OR trpd.id_jns_keluar='1') THEN 1 ELSE 0 END) AS mhs_lulus,
                    SUM(CASE WHEN (akm.id_stat_mhs='K' OR trpd.id_jns_keluar IN ('2','4','6','7')) THEN 1 ELSE 0 END) AS mhs_keluar,
                    SUM(CASE WHEN (akm.id_stat_mhs='A' AND trpd.id_jns_keluar IS NULL) THEN 1 ELSE 0 END) AS mhs_aktif,
                    SUM(CASE WHEN (akm.id_stat_mhs='M' AND trpd.id_jns_keluar IS NULL) THEN 1 ELSE 0 END) AS mhs_mbkm,
                    SUM(CASE WHEN (akm.id_stat_mhs='D' OR trpd.id_jns_keluar = '3') THEN 1 ELSE 0 END) AS mhs_do,
                    SUM(CASE WHEN akm.id_stat_mhs='N' THEN 1 ELSE 0 END) AS mhs_non_aktif,
                    SUM(CASE WHEN akm.id_stat_mhs='C' THEN 1 ELSE 0 END) AS mhs_cuti,
                    SUM(CASE WHEN p.id_kewarganegaraan='ID' THEN 1 ELSE 0 END) AS mhs_indonesia,
                    SUM(CASE WHEN p.id_kewarganegaraan!='ID' THEN 1 ELSE 0 END) AS mhs_asing,
                    COUNT(DISTINCT trpd.id_pd) AS total_mhs
                FROM pdrd.reg_pd AS trpd
                JOIN pdrd.peserta_didik AS p ON p.id_pd=trpd.id_pd AND p.soft_delete=0
                JOIN pdrd.kuliah_mhs AS akm ON akm.id_reg_pd=trpd.id_reg_pd AND akm.soft_delete=0
                    AND akm.id_smt=".$id_smt."
                WHERE trpd.soft_delete=0
                GROUP BY trpd.id_sms
            ) AS pd ON pd.id_sms=tsms.id_sms
            JOIN (
                SELECT kk.id_sms, COUNT(DISTINCT trnh.id_sdm) AS total_dosen_rasio FROM pdrd.reg_ptk AS trnh
                JOIN pdrd.akt_ajar_dosen AS ajar ON ajar.id_reg_ptk=trnh.id_reg_ptk AND ajar.soft_delete=0
                JOIN pdrd.kelas_kuliah AS kk ON kk.id_kls=ajar.id_kls AND kk.soft_delete=0
                    AND kk.id_smt=".$id_smt."
                WHERE trnh.soft_delete=0
                    AND trnh.id_jns_keluar IS NULL
                    AND trnh.id_sp='".env('APP_ID_SP')."'
                GROUP BY kk.id_sms
            ) AS snh ON snh.id_sms=tsms.id_sms
            WHERE tsdm.soft_delete=0
                ".$condition."
            GROUP BY tsms.id_sms, tfak.nm_lemb, tsms.id_jur_unila, tsms.id_jenj_didik, tsms.nm_lemb, tsms.stat_prodi, snh.total_dosen_rasio, tj.nm_jenj_didik, pd.mhs_aktif, pd.mhs_non_aktif, pd.mhs_do, pd.mhs_cuti, pd.mhs_keluar, pd.mhs_mbkm, pd.mhs_lulus, pd.mhs_indonesia, pd.mhs_asing, pd.total_mhs
            ORDER BY tfak.nm_lemb ASC, tsms.id_jur_unila ASC, tsms.nm_lemb ASC, tsms.id_jenj_didik DESC
        ";
        return DB::SELECT($query);
    }
}
