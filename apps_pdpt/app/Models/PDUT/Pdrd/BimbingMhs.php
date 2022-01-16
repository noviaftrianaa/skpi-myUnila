<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class BimbingMhs extends Model
{
    protected $table = 'pdrd.bimbing_mhs';
    protected $primaryKey = 'id_bimb_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_mhs',	'id_katgiat',	'id_sdm',	'id_akt_mhs',	'urutan_promotor',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}