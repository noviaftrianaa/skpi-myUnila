<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokLaporanStudi extends AbstractionModel
{
    protected $table = 'dok.dok_laporan_studi';
    protected $primaryKey = 'id_lap_studi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lap_studi',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}