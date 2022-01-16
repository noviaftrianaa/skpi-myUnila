<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Agama extends AbstractionModel
{
    protected $table = 'ref.agama';
    protected $primaryKey = 'id_agama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_agama',	'nm_agama',
    ];
}