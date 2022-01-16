<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AnggotaPanitia extends Model
{
    protected $table = 'pdrd.anggota_panitia';
    protected $primaryKey = 'id_ang_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_panitia',	'id_panitia',	'id_sdm',	'id_katgiat',	'peran',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}