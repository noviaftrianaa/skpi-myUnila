<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Tunjangan extends Model
{
    protected $table = 'pdrd.tunjangan';
    protected $primaryKey = 'id_tunj';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tunj',	'id_sdm',	'id_jns_tunj',	'nm_tunj',	'instansi',	'sumber_dana',	'dari_thn',	'sampai_thn',	'nominal',	'stat',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}