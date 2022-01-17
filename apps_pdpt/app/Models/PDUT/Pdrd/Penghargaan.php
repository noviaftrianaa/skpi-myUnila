<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Penghargaan extends Model
{
    protected $table = 'pdrd.penghargaan';
    protected $primaryKey = 'id_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghargaan',	'id_sdm',	'id_jns_penghargaan',	'id_tkt_penghargaan',	'id_katgiat',	'nm_penghargaan',	'tgl_penghargaan',	'thn_penghargaan',	'instansi',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}