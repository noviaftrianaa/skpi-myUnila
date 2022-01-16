<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RwyDidikNonformal extends AbstractionModel
{
    protected $table = 'pdrd.rwy_didik_nonformal';
    protected $primaryKey = 'id_rwy_didik_nonformal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_didik_nonformal',	'id_sms',	'id_rwy_didik_formal',	'no_sk_setara',	'tgl_sk_setara',	'tmt_sk_setara',	'level_kkni',	'nm_prodi_penyetara',	'id_creator',	'id_updater',	'soft_delete',
    ];
}