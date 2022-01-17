<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class BimbingDosen extends Model
{
    protected $table = 'pdrd.bimbing_dosen';
    protected $primaryKey = 'id_bimb_dosen';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_dosen',	'id_katgiat',	'tgl_mulai',	'tgl_selesai',	'bid_ahli_pembimbing',	'bid_ahli_bimbingan',	'desk_kegiatan',	'jns_bimbing',	'sk_tugas',	'tgl_sk_tugas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}