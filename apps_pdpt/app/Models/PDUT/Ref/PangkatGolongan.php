<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class PangkatGolongan extends AbstractionModel
{
    protected $table = 'ref.pangkat_golongan';
    protected $primaryKey = 'id_pangkat_gol';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pangkat_gol',	'kode_gol',	'nm_pangkat',
    ];
}