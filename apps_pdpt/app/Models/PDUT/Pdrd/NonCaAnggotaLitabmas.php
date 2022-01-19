<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class NonCaAnggotaLitabmas extends Model
{
    protected $table = 'pdrd.non_ca_anggota_litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [

	'id_litabmas',
	'id_orang',
	'peran_litabmas',
	'stat_aktif',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}