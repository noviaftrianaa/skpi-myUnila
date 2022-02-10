<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Sms extends Model
{
    protected $table = 'pdrd.sms';
    protected $primaryKey = 'id_sms';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sms',	'nm_lemb',	'kd_kl',	'kd_satker',	'smt_mulai',	'a_selenggara_subst',	'stat_prodi_unila',	'kode_prodi',	'nm_prodi_english',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'lintang',	'bujur',	'no_tel',	'no_fax',	'email',	'website',	'singkatan',	'tgl_berdiri',	'sk_selenggara',	'tgl_sk_selenggara',	'tmt_sk_selenggara',	'tst_sk_selenggara',	'kpst_pd',	'sks_lulus',	'gelar_lulusan',	'stat_prodi',	'polesei_nilai',	'a_kependidikan',	'sistem_ajar',	'a_pjj',	'a_psdku',	'luas_lab',	'kapasitas_prak_satu_shift',	'jml_mhs_pengguna',	'jml_jam_penggunaan',	'jml_prodi_pengguna',	'jml_modul_prak_sendiri',	'jml_modul_prak_lain',	'fungsi_selain_prak',	'penggunaan_lab',	'a_pkl',	'id_sp',	'id_jenj_didik',	'id_jns_sms',	'id_fungsi_lab',	'id_kel_usaha',	'id_blob',	'id_wil',	'id_jur',	'id_induk_sms',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}