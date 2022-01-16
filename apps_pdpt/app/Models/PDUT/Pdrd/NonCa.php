<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class NonCa extends AbstractionModel
{
    protected $table = 'pdrd.non_ca';
    protected $primaryKey = 'id_orang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_orang',	'id_negara',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'nm_orang',	'jk',	'nik',	'tmpt_lahir',	'tgl_lahir',	'no_tel_rmh',	'no_hp',	'email',	'npwp',	'id_creator',	'id_updater',	'soft_delete',
    ];
}