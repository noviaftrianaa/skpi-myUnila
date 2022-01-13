<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class PesertaDidik extends AbstractionModel
{
    protected $table = 'pdrd.peserta_didik';
    protected $primaryKey = 'a_terima_kps';
    protected $fillable = [
    	'a_terima_kps',		'ds_kel',		'id_agama',		'id_alat_transport',		'id_blob',		'id_creator',		'id_jns_tinggal',		'id_kewarganegaraan',		'id_kk',		'id_kk_ayah',		'id_kk_ibu',		'id_pd',		'id_pekerjaan_ayah',		'id_pekerjaan_ibu',		'id_pekerjaan_wali',		'id_pendidikan_ayah',		'id_pendidikan_ibu',		'id_pendidikan_wali',		'id_penghasilan_ayah',		'id_penghasilan_ibu',		'id_penghasilan_wali',		'id_stat_mhs',		'id_updater',		'id_wil',		'jk',		'jln',		'kode_pos',		'nik',		'nik_ayah',		'nik_ibu',		'nisn',		'nm_ayah',		'nm_dsn',		'nm_ibu_kandung',		'nm_pd',		'nm_wali',		'no_kps',		'rt',		'rw',		'soft_delete',		'tgl_lahir',		'tgl_lahir_ayah',		'tgl_lahir_ibu',		'tgl_lahir_wali',		'tlpn_hp',		'tlpn_rumah',		'tmpt_lahir',
    ];
}
