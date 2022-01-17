<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class NonCa extends Model
{
    protected $table = 'pdrd.non_ca';
    protected $primaryKey = 'id_orang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_orang',	'id_negara',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'nm_orang',	'jk',	'nik',	'tmpt_lahir',	'tgl_lahir',	'no_tel_rmh',	'no_hp',	'email',	'npwp',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}