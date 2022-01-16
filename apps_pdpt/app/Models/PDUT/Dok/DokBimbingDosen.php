<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokBimbingDosen extends AbstractionModel
{
    protected $table = 'dok.dok_bimbing_dosen';
    protected $primaryKey = 'id_bimb_dosen';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_dosen',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}