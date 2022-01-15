<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokRwyKepangkatan extends AbstractionModel
{
    protected $table = 'dok.dok_rwy_kepangkatan';
    protected $primaryKey = 'id_rwy_pangkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_pangkat',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}