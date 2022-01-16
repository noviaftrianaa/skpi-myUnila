<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class UjiMhs extends AbstractionModel
{
    protected $table = 'pdrd.uji_mhs';
    protected $primaryKey = 'id_uji_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_uji_mhs',	'id_sdm',	'id_katgiat',	'id_akt_mhs',	'urutan_uji',	'id_creator',	'id_updater',	'soft_delete',
    ];
}