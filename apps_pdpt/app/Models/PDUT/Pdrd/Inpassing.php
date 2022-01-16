<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Inpassing extends AbstractionModel
{
    protected $table = 'pdrd.inpassing';
    protected $primaryKey = 'id_inpassing';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_inpassing',	'id_sdm',	'id_pangkat_gol',	'sk_inpassing',	'tgl_sk_inpassing',	'tmt_sk_inpassing',	'angka_kredit',	'masa_kerja_thn',	'masa_kerja_bln',	'id_creator',	'id_updater',	'soft_delete',
    ];
}