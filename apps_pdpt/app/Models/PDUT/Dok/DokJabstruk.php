<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokJabstruk extends AbstractionModel
{
    protected $table = 'dok.dok_jabstruk';
    protected $primaryKey = 'id_rwy_jabstruk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_jabstruk',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}