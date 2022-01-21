<?php

namespace App\Models\PDUT\Presensi;

use Illuminate\Database\Eloquent\Model;

class KehadiranMhs extends Model
{
    protected $table = 'presensi.kehadiran_mhs';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',	'id_kls',	'id_hadir_mhs',	'tgl_hadir',	'waktu_presensi',	'stat_hadir',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}