<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class LaporanStudi extends AbstractionModel
{
    protected $table = 'pdrd.laporan_studi';
    protected $primaryKey = 'domisili';
    protected $fillable = [
    	'domisili',		'hambatan',		'id_creator',		'id_lap_studi',		'id_updater',		'ipk',		'ips',		'kemajuan_riset',		'sks_kumulatif',		'sks_semester',		'smt',		'soft_delete',		'solusi',		'stat_kemajuan',
    ];
}
