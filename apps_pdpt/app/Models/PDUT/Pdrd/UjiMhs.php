<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class UjiMhs extends AbstractionModel
{
    protected $table = 'pdrd.uji_mhs';
    protected $primaryKey = 'id_akt_mhs';
    protected $fillable = [
    	'id_akt_mhs',		'id_creator',		'id_katgiat',		'id_sdm',		'id_uji_mhs',		'id_updater',		'soft_delete',		'urutan_uji',
    ];
}
