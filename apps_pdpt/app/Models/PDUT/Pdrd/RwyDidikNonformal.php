<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RwyDidikNonformal extends Model
{
    protected $table = 'pdrd.rwy_didik_nonformal';
    protected $primaryKey = 'id_rwy_didik_nonformal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_didik_nonformal',	'id_sms',	'id_rwy_didik_formal',	'no_sk_setara',	'tgl_sk_setara',	'tmt_sk_setara',	'level_kkni',	'nm_prodi_penyetara',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}