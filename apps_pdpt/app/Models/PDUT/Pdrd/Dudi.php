<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Dudi extends AbstractionModel
{
    protected $table = 'pdrd.dudi';
    protected $primaryKey = 'id_dudi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dudi',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'nm_lemb',	'lintang',	'bujur',	'no_tel',	'no_fax',	'email',	'website',	'npwp',	'nm_wp',	'kip',	'alamat_kanpus',	'email_kanpus',	'telp_kanpus',	'website_kanpus',	'fax_kanpus',	'jml_tmpt_tidur',	'jml_pasien_rawat_inap',	'jml_pasien_rawat_jln',	'variasi_kasus',	'id_wil',	'id_bu',	'id_creator',	'id_updater',	'soft_delete',
    ];
}