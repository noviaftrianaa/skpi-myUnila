<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AnggotaOrgprof extends AbstractionModel
{
    protected $table = 'pdrd.anggota_orgprof';
    protected $primaryKey = 'id_ang_orgprof';
    protected $fillable = [
    	'id_ang_orgprof',		'id_creator',		'id_katgiat',		'id_sdm',		'id_updater',		'instansi_profesi',		'mulai_anggota',		'nm_org',		'peran',		'selesai_anggota',		'soft_delete',
    ];
}
