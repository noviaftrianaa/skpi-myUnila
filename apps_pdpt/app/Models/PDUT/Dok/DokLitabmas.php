<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokLitabmas extends AbstractionModel
{
    protected $table = 'dok.dok_litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_litabmas',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}