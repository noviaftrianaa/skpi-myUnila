<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class VisitingScientist extends Model
{
    protected $table = 'pdrd.visiting_scientist';
    protected $primaryKey = 'id_visit';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_visit',
	'id_sdm',
	'id_katgiat',
	'id_sp',
	'id_litabmas',
	'id_kat_capaian',
	'pt_pengundang',
	'lama_kegiatan',
	'kegiatan_penting',
	'tgl_laks',
	'sk_tugas',
	'tgl_sk_tugas',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
