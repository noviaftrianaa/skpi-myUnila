<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class VisitingScientist extends AbstractionModel
{
    protected $table = 'pdrd.visiting_scientist';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_kat_capaian',		'id_katgiat',		'id_litabmas',		'id_sdm',		'id_sp',		'id_updater',		'id_visit',		'kegiatan_penting',		'lama_kegiatan',		'pt_pengundang',		'sk_tugas',		'soft_delete',		'tgl_laks',		'tgl_sk_tugas',
    ];
}
