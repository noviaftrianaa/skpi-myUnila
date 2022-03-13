<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyFungsional extends AbstractionModel
{
    protected $table = 'pdrd.rwy_fungsional';
    protected $primaryKey = 'id_rwy_jabfung';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_jabfung',
	'id_sdm',
	'id_kel_bidang',
	'id_jabfung',
	'sk_jabfung',
	'tmt_sk_jabfung',
	'angka_kredit',
	'lebih_ajar',
	'lebih_lit',
	'lebih_pengmas',
	'lebih_tunjang',
	'bidang_ilmu',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
