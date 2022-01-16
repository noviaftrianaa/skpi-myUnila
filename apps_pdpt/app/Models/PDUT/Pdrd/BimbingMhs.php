<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class BimbingMhs extends AbstractionModel
{
    protected $table = 'pdrd.bimbing_mhs';
    protected $primaryKey = 'id_bimb_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_mhs',	'id_katgiat',	'id_sdm',	'id_akt_mhs',	'urutan_promotor',	'id_creator',	'id_updater',	'soft_delete',
    ];
}