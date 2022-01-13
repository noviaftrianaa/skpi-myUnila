<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Pembicara extends AbstractionModel
{
    protected $table = 'pdrd.pembicara';
    protected $primaryKey = 'bahasa';
    protected $fillable = [
    	'bahasa',		'id_afiliasi',		'id_creator',		'id_kat_capaian',		'id_katgiat',		'id_litabmas',		'id_pembicara',		'id_sdm',		'id_updater',		'jns_afiliasi',		'judul_makalah',		'kat_bicara',		'nm_temu_ilmiah',		'penyelenggara',		'sk_tugas',		'soft_delete',		'tgl_laks',		'tgl_sk_tugas',		'tkt_temu',
    ];
}
