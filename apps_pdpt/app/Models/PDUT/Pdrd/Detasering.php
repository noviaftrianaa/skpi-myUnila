<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Detasering extends AbstractionModel
{
    protected $table = 'pdrd.detasering';
    protected $primaryKey = 'bid_tgs';
    protected $fillable = [
    	'bid_tgs',		'desk_keg',		'id_creator',		'id_detasering',		'id_katgiat',		'id_sdm',		'id_sp_sasaran',		'id_sp_sumber',		'id_updater',		'metode_laks',		'sk_tugas',		'soft_delete',		'tgl_mulai',		'tgl_selesai',		'tgl_sk_tugas',
    ];
}
