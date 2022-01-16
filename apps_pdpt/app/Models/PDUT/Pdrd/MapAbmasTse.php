<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class MapAbmasTse extends AbstractionModel
{
    protected $table = 'pdrd.map_abmas_tse';
    protected $primaryKey = 'id_tse';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tse',	'id_litabmas',	'urutan3',	'id_creator',	'id_updater',	'soft_delete',
    ];
}