<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class LaporanStudi extends AbstractionModel
{
    protected $table = 'pdrd.laporan_studi';
    protected $primaryKey = 'id_lap_studi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lap_studi',	'smt',	'domisili',	'sks_semester',	'ips',	'sks_kumulatif',	'ipk',	'hambatan',	'solusi',	'kemajuan_riset',	'stat_kemajuan',	'id_creator',	'id_updater',	'soft_delete',
    ];
}