<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Dudi extends AbstractionModel
{
    protected $table = 'pdrd.dudi';
    protected $primaryKey = 'alamat_kanpus';
    protected $fillable = [
    	'alamat_kanpus',		'bujur',		'ds_kel',		'email',		'email_kanpus',		'fax_kanpus',		'id_bu',		'id_creator',		'id_dudi',		'id_updater',		'id_wil',		'jln',		'jml_pasien_rawat_inap',		'jml_pasien_rawat_jln',		'jml_tmpt_tidur',		'kip',		'kode_pos',		'lintang',		'nm_dsn',		'nm_lemb',		'nm_wp',		'no_fax',		'no_tel',		'npwp',		'rt',		'rw',		'soft_delete',		'telp_kanpus',		'variasi_kasus',		'website',		'website_kanpus',
    ];
}
