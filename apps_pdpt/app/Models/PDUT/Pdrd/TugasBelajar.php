<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TugasBelajar extends AbstractionModel
{
    protected $table = 'pdrd.tugas_belajar';
    protected $primaryKey = 'domisili';
    protected $fillable = [
    	'domisili',		'id_creator',		'id_jenj_didik',		'id_negara',		'id_sdm',		'id_sp',		'id_tb',		'id_updater',		'nm_prodi',		'pembiayaan',		'sk_tb',		'soft_delete',		'tgl_lulus',		'tgl_mulai_tb',		'tgl_sk_tb',
    ];
}
