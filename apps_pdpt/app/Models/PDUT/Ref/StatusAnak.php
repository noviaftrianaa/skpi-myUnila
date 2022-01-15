<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusAnak extends AbstractionModel
{
    protected $table = 'ref.status_anak';
    protected $primaryKey = 'id_stat_anak';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_anak',	'nm_stat_anak',
    ];
}