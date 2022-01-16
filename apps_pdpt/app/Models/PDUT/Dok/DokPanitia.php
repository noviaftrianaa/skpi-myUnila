<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokPanitia extends AbstractionModel
{
    protected $table = 'dok.dok_panitia';
    protected $primaryKey = 'id_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_panitia',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}