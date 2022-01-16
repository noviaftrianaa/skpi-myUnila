<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class MapPublikasiBidang extends AbstractionModel
{
    protected $table = 'pdrd.map_publikasi_bidang';
    protected $primaryKey = 'id_kel_bidang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_bidang',	'id_publikasi',	'urutan',	'id_creator',	'id_updater',	'soft_delete',
    ];
}