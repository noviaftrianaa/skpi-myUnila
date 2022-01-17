<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class UjiMhs extends Model
{
    protected $table = 'pdrd.uji_mhs';
    protected $primaryKey = 'id_uji_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_uji_mhs',	'id_sdm',	'id_katgiat',	'id_akt_mhs',	'urutan_uji',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}