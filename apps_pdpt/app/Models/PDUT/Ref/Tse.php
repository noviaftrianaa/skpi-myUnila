<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Tse extends AbstractionModel
{
    protected $table = 'ref.tse';
    protected $primaryKey = 'id_tse';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tse',	'kode_tse',	'nm_tse',
    ];
}