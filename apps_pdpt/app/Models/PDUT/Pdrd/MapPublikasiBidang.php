<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class MapPublikasiBidang extends Model
{
    protected $table = 'pdrd.map_publikasi_bidang';
    protected $primaryKey = 'id_kel_bidang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_bidang',	'id_publikasi',	'urutan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}