<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokDetasering extends AbstractionModel
{
    protected $table = 'dok.dok_detasering';
    protected $primaryKey = 'id_detasering';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_detasering',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}