<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Litabmas extends AbstractionModel
{
    protected $table = 'pdrd.litabmas';
    protected $primaryKey = 'dana_dikti';
    protected $fillable = [
    	'dana_dikti',		'dana_institusi_lain',		'dana_pt',		'id_creator',		'id_jns_lit',		'id_kel_bidang',		'id_lanjutan_litabmas',		'id_lemb_iptek',		'id_litabmas',		'id_skim',		'id_smi',		'id_thn_kegiatan',		'id_thn_laks',		'id_thn_usulan',		'id_tse',		'id_updater',		'in_kind',		'jns_litabmas',		'judul_litabmas',		'lama_kegiatan',		'lokasi_kegiatan',		'sk_tugas',		'soft_delete',		'stat_aktif',		'tgl_sk_tugas',		'thn_laks_ke',
    ];
}
