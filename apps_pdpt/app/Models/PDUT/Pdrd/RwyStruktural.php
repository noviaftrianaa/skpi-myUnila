<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RwyStruktural extends Model
{
    protected $table = 'pdrd.rwy_struktural';
    protected $primaryKey = 'id_rwy_jabstruk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_jabstruk',	'id_sdm',	'id_katgiat',	'id_jab_tgs',	'sk_jabstruk',	'tmt_sk_jabstruk',	'tst_sk_jabstruk',	'lokasi_tugas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}