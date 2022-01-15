<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokRwySertifikasi extends AbstractionModel
{
    protected $table = 'dok.dok_rwy_sertifikasi';
    protected $primaryKey = 'id_rwy_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_sert',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}