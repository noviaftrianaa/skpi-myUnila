<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokAngOrgprof extends AbstractionModel
{
    protected $table = 'dok.dok_ang_orgprof';
    protected $primaryKey = 'id_ang_orgprof';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_orgprof',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}