<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Detasering extends Model
{
    protected $table = 'pdrd.detasering';
    protected $primaryKey = 'id_detasering';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_detasering',	'id_sdm',	'id_sp_sumber',	'id_sp_sasaran',	'id_katgiat',	'tgl_mulai',	'tgl_selesai',	'bid_tgs',	'desk_keg',	'metode_laks',	'sk_tugas',	'tgl_sk_tugas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}