<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyStruktural extends AbstractionModel
{
    protected $table = 'pdrd.rwy_struktural';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jab_tgs',		'id_katgiat',		'id_rwy_jabstruk',		'id_sdm',		'id_updater',		'lokasi_tugas',		'sk_jabstruk',		'soft_delete',		'tmt_sk_jabstruk',		'tst_sk_jabstruk',
    ];
}
