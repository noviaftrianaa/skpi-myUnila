<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class MapLitabmasBidang extends AbstractionModel
{
    protected $table = 'pdrd.map_litabmas_bidang';
    protected $primaryKey = 'id_kel_bidang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_bidang',	'id_litabmas',	'urutan2',	'id_creator',	'id_updater',	'soft_delete',
    ];
}