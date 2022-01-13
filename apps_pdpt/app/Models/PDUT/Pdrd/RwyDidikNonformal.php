<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyDidikNonformal extends AbstractionModel
{
    protected $table = 'pdrd.rwy_didik_nonformal';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_rwy_didik_formal',		'id_rwy_didik_nonformal',		'id_sms',		'id_updater',		'level_kkni',		'nm_prodi_penyetara',		'no_sk_setara',		'soft_delete',		'tgl_sk_setara',		'tmt_sk_setara',
    ];
}
