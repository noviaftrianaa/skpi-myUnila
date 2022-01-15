<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class KuliahMhs extends AbstractionModel
{
    protected $table = 'pdrd.kuliah_mhs';
    protected $primaryKey = 'id_reg_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_pd',	'id_smt',	'id_stat_mhs',	'ips',	'sks_semester',	'ipk',	'total_sks',	'biaya_smt',	'id_creator',	'id_updater',	'soft_delete',
    ];
}