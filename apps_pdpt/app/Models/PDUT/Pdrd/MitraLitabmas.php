<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class MitraLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.mitra_litabmas';
    protected $primaryKey = 'id_dudi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dudi',	'id_litabmas',	'id_creator',	'id_updater',	'soft_delete',
    ];
}