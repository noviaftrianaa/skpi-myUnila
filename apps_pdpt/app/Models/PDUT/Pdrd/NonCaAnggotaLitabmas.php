<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class NonCaAnggotaLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.non_ca_anggota_litabmas';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_litabmas',		'id_orang',		'id_updater',		'peran_litabmas',		'soft_delete',		'stat_aktif',
    ];
}
