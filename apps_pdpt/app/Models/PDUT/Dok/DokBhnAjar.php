<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokBhnAjar extends AbstractionModel
{
    protected $table = 'dok.dok_bhn_ajar';
    protected $primaryKey = 'id_buku_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_buku_ajar',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}