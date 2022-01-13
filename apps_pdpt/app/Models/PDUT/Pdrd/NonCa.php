<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class NonCa extends AbstractionModel
{
    protected $table = 'pdrd.non_ca';
    protected $primaryKey = 'ds_kel';
    protected $fillable = [
    	'ds_kel',		'email',		'id_creator',		'id_negara',		'id_orang',		'id_updater',		'jk',		'jln',		'kode_pos',		'nik',		'nm_dsn',		'nm_orang',		'no_hp',		'no_tel_rmh',		'npwp',		'rt',		'rw',		'soft_delete',		'tgl_lahir',		'tmpt_lahir',
    ];
}
