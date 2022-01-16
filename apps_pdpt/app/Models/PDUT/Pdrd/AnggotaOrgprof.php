<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class AnggotaOrgprof extends AbstractionModel
{
    protected $table = 'pdrd.anggota_orgprof';
    protected $primaryKey = 'id_ang_orgprof';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_orgprof',	'id_katgiat',	'id_sdm',	'nm_org',	'peran',	'mulai_anggota',	'selesai_anggota',	'instansi_profesi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}