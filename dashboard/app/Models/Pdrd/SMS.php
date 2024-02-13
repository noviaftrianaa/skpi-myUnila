<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
