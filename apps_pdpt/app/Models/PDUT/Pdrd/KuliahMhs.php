<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class KuliahMhs extends Model
{
    protected $table = 'pdrd.kuliah_mhs';
    protected $primaryKey = 'id_reg_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_pd',	'id_smt',	'id_stat_mhs',	'ips',	'sks_semester',	'ipk',	'total_sks',	'biaya_smt',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}