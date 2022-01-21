<?php

namespace App\Models\PDUT\Tracer;

use Illuminate\Database\Eloquent\Model;

class UmrWilayah extends Model
{
    protected $table = 'tracer.umr_wilayah';
    protected $primaryKey = 'id_umr_wil';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_umr_wil',	'id_wil',	'id_tahun_anggaran',	'besaran_umr',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}