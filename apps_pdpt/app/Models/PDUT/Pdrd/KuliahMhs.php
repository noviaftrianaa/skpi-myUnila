<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KuliahMhs extends AbstractionModel
{
    protected $table = 'pdrd.kuliah_mhs';
    protected $primaryKey = 'biaya_smt';
    protected $fillable = [
    	'biaya_smt',		'id_creator',		'id_reg_pd',		'id_smt',		'id_stat_mhs',		'id_updater',		'ipk',		'ips',		'sks_semester',		'soft_delete',		'total_sks',
    ];
}
