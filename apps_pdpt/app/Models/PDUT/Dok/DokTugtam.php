<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokTugtam extends AbstractionModel
{
    protected $table = 'dok.dok_tugtam';
    protected $primaryKey = 'id_tgs_tambah';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tgs_tambah',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}