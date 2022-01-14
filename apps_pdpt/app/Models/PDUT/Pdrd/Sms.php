<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Sms extends AbstractionModel
{
    protected $table = 'pdrd.sms';
    protected $primaryKey = 'a_kependidikan';
    protected $fillable = [
    	'a_kependidikan',		'a_pjj',		'a_pkl',		'a_psdku',		'a_selenggara_subst',		'bujur',		'ds_kel',		'email',		'fungsi_selain_prak',		'gelar_lulusan',		'id_blob',		'id_creator',		'id_fungsi_lab',		'id_induk_sms',		'id_jenj_didik',		'id_jns_sms',		'id_jur',		'id_kel_usaha',		'id_sms',		'id_sp',		'id_updater',		'id_wil',		'jln',		'jml_jam_penggunaan',		'jml_mhs_pengguna',		'jml_modul_prak_lain',		'jml_modul_prak_sendiri',		'jml_prodi_pengguna',		'kapasitas_prak_satu_shift',		'kd_kl',		'kd_satker',		'kode_pos',		'kode_prodi',		'kpst_pd',		'lintang',		'luas_lab',		'nm_dsn',		'nm_lemb',		'nm_prodi_english',		'no_fax',		'no_tel',		'penggunaan_lab',		'polesei_nilai',		'rt',		'rw',		'singkatan',		'sistem_ajar',		'sk_selenggara',		'sks_lulus',		'smt_mulai',		'soft_delete',		'stat_prodi',		'tgl_berdiri',		'tgl_sk_selenggara',		'tmt_sk_selenggara',		'tst_sk_selenggara',		'website',
    ];
}
