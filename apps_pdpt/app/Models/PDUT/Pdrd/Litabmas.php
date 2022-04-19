<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Litabmas extends Model
{
    protected $table = 'pdrd.litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_litabmas',
	'id_lemb_iptek',
	'judul_litabmas',
	'lama_kegiatan',
	'thn_laks_ke',
	'dana_dikti',
	'dana_pt',
	'dana_institusi_lain',
	'in_kind',
	'stat_aktif',
	'jns_litabmas',
	'sk_tugas',
	'tgl_sk_tugas',
	'lokasi_kegiatan',
	'id_skim',
	'id_thn_usulan',
	'id_thn_kegiatan',
	'id_thn_laks',
	'id_lanjutan_litabmas',
	'id_kel_bidang',
	'id_tse',
	'id_smi',
	'id_jns_lit',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
