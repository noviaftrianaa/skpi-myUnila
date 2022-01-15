<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokVisitScientist extends AbstractionModel
{
    protected $table = 'dok.dok_visit_scientist';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_visit',	'id_creator',	'id_updater',	'soft_delete',
    ];
}