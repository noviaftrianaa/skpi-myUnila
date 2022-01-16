<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Tunjangan extends AbstractionModel
{
    protected $table = 'pdrd.tunjangan';
    protected $primaryKey = 'id_tunj';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tunj',	'id_sdm',	'id_jns_tunj',	'nm_tunj',	'instansi',	'sumber_dana',	'dari_thn',	'sampai_thn',	'nominal',	'stat',	'id_creator',	'id_updater',	'soft_delete',
    ];
}