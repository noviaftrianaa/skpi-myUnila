<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class LevelWilayah extends AbstractionModel
{
    protected $table = 'ref.level_wilayah';
    protected $primaryKey = 'id_level_wil';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_level_wil',	'nm_level_wilayah',
    ];
}