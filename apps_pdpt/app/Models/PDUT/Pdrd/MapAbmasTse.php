<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class MapAbmasTse extends Model
{
    protected $table = 'pdrd.map_abmas_tse';
    protected $primaryKey = 'id_tse';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tse',	'id_litabmas',	'urutan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}