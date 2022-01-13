<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class BimbingDosen extends AbstractionModel
{
    protected $table = 'pdrd.bimbing_dosen';
    protected $primaryKey = 'bid_ahli_bimbingan';
    protected $fillable = [
    	'bid_ahli_bimbingan',		'bid_ahli_pembimbing',		'desk_kegiatan',		'id_bimb_dosen',		'id_creator',		'id_katgiat',		'id_updater',		'jns_bimbing',		'sk_tugas',		'soft_delete',		'tgl_mulai',		'tgl_selesai',		'tgl_sk_tugas',
    ];
}
