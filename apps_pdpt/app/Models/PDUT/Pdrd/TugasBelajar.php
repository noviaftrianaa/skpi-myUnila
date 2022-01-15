<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class TugasBelajar extends AbstractionModel
{
    protected $table = 'pdrd.tugas_belajar';
    protected $primaryKey = 'id_tb';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tb',	'id_sp',	'id_jenj_didik',	'id_sdm',	'nm_prodi',	'tgl_mulai_tb',	'domisili',	'sk_tb',	'tgl_sk_tb',	'pembiayaan',	'tgl_lulus',	'id_negara',	'id_creator',	'id_updater',	'soft_delete',
    ];
}