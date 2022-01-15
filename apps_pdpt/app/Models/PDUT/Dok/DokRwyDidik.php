<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokRwyDidik extends AbstractionModel
{
    protected $table = 'dok.dok_rwy_didik';
    protected $primaryKey = 'id_rwy_didik_formal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_didik_formal',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}