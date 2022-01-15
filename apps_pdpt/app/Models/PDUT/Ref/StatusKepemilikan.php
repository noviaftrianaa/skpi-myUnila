<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusKepemilikan extends AbstractionModel
{
    protected $table = 'ref.status_kepemilikan';
    protected $primaryKey = 'id_stat_milik';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_milik',	'nm_stat_milik',
    ];
}