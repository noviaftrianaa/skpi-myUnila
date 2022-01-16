<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusKepegawaian extends AbstractionModel
{
    protected $table = 'ref.status_kepegawaian';
    protected $primaryKey = 'id_stat_pegawai';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_pegawai',	'nm_stat_pegawai',
    ];
}