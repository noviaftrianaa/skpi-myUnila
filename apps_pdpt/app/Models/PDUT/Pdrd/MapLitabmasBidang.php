<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class MapLitabmasBidang extends Model
{
    protected $table = 'pdrd.map_litabmas_bidang';
    protected $primaryKey = 'id_kel_bidang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_bidang',	'id_litabmas',	'urutan2',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}