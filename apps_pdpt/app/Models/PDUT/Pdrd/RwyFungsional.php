<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyFungsional extends AbstractionModel
{
    protected $table = 'pdrd.rwy_fungsional';
    protected $primaryKey = 'angka_kredit';
    protected $fillable = [
    	'angka_kredit',		'bidang_ilmu',		'id_creator',		'id_jabfung',		'id_kel_bidang',		'id_rwy_jabfung',		'id_sdm',		'id_updater',		'lebih_ajar',		'lebih_lit',		'lebih_pengmas',		'lebih_tunjang',		'sk_jabfung',		'soft_delete',		'tmt_sk_jabfung',
    ];
}
