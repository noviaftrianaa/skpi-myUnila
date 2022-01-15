<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RwyKepangkatan extends AbstractionModel
{
    protected $table = 'pdrd.rwy_kepangkatan';
    protected $primaryKey = 'id_rwy_pangkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_pangkat',	'id_sdm',	'id_pangkat_gol',	'sk_pangkat',	'tgl_sk_pangkat',	'tmt_sk_pangkat',	'masa_kerja_gol_thn',	'masa_kerja_gol_bln',	'id_creator',	'id_updater',	'soft_delete',
    ];
}