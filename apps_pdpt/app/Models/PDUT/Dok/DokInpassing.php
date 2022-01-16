<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokInpassing extends AbstractionModel
{
    protected $table = 'dok.dok_inpassing';
    protected $primaryKey = 'id_inpassing';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_inpassing',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}