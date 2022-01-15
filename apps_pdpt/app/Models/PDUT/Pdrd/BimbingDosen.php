<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class BimbingDosen extends AbstractionModel
{
    protected $table = 'pdrd.bimbing_dosen';
    protected $primaryKey = 'id_bimb_dosen';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_dosen',	'id_katgiat',	'tgl_mulai',	'tgl_selesai',	'bid_ahli_pembimbing',	'bid_ahli_bimbingan',	'desk_kegiatan',	'jns_bimbing',	'sk_tugas',	'tgl_sk_tugas',	'id_creator',	'id_updater',	'soft_delete',
    ];
}