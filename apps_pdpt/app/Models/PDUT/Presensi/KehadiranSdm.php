<?php

namespace App\Models\PDUT\Presensi;

use Illuminate\Database\Eloquent\Model;

class KehadiranSdm extends Model
{
    protected $table = 'presensi.kehadiran_sdm';
    protected $primaryKey = 'id_kehadiran_sdm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kehadiran_sdm',	'id_sdm',	'tgl_hadir',	'waktu_presensi',	'lokasi_presensi',	'waktu_pulang',	'lokasi_pulang',	'rencana_hari_ini',	'realisasi_hari_ini',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}