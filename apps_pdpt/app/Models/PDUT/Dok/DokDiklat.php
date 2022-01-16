<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokDiklat extends AbstractionModel
{
    protected $table = 'dok.dok_diklat';
    protected $primaryKey = 'id_diklat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_diklat',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}