<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class BimbingMhs extends AbstractionModel
{
    protected $table = 'pdrd.bimbing_mhs';
    protected $primaryKey = 'id_akt_mhs';
    protected $fillable = [
    	'id_akt_mhs',		'id_bimb_mhs',		'id_creator',		'id_katgiat',		'id_sdm',		'id_updater',		'soft_delete',		'urutan_promotor',
    ];
}
