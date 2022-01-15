<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokAktMhs extends AbstractionModel
{
    protected $table = 'dok.dok_akt_mhs';
    protected $primaryKey = 'id_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akt_mhs',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}