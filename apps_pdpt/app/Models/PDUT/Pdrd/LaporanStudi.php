<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class LaporanStudi extends Model
{
    protected $table = 'pdrd.laporan_studi';
    protected $primaryKey = 'id_lap_studi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lap_studi',	'smt',	'domisili',	'sks_semester',	'ips',	'sks_kumulatif',	'ipk',	'hambatan',	'solusi',	'kemajuan_riset',	'stat_kemajuan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}