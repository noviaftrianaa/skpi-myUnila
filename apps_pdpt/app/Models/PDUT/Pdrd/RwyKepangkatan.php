<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyKepangkatan extends AbstractionModel
{
    protected $table = 'pdrd.rwy_kepangkatan';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_pangkat_gol',		'id_rwy_pangkat',		'id_sdm',		'id_updater',		'masa_kerja_gol_bln',		'masa_kerja_gol_thn',		'sk_pangkat',		'soft_delete',		'tgl_sk_pangkat',		'tmt_sk_pangkat',
    ];
}
