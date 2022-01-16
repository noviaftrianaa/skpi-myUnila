<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokPembicara extends AbstractionModel
{
    protected $table = 'dok.dok_pembicara';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_pembicara',	'id_creator',	'id_updater',	'soft_delete',
    ];
}