<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokPub extends AbstractionModel
{
    protected $table = 'dok.dok_pub';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_publikasi',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}