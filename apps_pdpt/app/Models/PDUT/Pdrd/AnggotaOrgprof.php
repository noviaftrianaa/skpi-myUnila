<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AnggotaOrgprof extends Model
{
    protected $table = 'pdrd.anggota_orgprof';
    protected $primaryKey = 'id_ang_orgprof';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_orgprof',	'id_katgiat',	'id_sdm',	'nm_org',	'peran',	'mulai_anggota',	'selesai_anggota',	'instansi_profesi',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}