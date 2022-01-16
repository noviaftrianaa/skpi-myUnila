<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokPengelolaJurnal extends AbstractionModel
{
    protected $table = 'dok.dok_pengelola_jurnal';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_kelola_jurnal',	'id_creator',	'id_updater',	'soft_delete',
    ];
}