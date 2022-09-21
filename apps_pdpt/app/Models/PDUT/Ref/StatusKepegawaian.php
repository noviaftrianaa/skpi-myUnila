<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusKepegawaian extends Model
{
    protected $table = 'ref.status_kepegawaian';
    protected $primaryKey = 'id_stat_pegawai';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_pegawai',	'nm_stat_pegawai',	'create_date',	'last_update',
    ];
}