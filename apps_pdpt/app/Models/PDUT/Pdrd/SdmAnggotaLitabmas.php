<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class SdmAnggotaLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.sdm_anggota_litabmas';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_katgiat',		'id_litabmas',		'id_sdm',		'id_updater',		'peran_litabmas',		'soft_delete',		'stat_aktif',
    ];
}
