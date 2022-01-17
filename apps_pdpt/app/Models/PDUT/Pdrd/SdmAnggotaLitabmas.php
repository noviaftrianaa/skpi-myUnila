<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class SdmAnggotaLitabmas extends Model
{
    protected $table = 'pdrd.sdm_anggota_litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_litabmas',	'id_sdm',	'id_katgiat',	'peran_litabmas',	'stat_aktif',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}