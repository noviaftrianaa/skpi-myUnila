<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokPenghargaan extends AbstractionModel
{
    protected $table = 'dok.dok_penghargaan';
    protected $primaryKey = 'id_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghargaan',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}