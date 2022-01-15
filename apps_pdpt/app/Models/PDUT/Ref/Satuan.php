<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Satuan extends AbstractionModel
{
    protected $table = 'ref.satuan';
    protected $primaryKey = 'kd_satuan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'kd_satuan',	'nm_satuan',
    ];
}