<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class PdAnggotaLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.pd_anggota_litabmas';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_litabmas',		'id_pd',		'id_pd_ang_litabmas',		'id_updater',		'nipd',		'nm_pd',		'peran_litabmas',		'soft_delete',		'stat_aktif',
    ];
}
