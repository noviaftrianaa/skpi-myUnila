<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KurikulumSp extends AbstractionModel
{
    protected $table = 'pdrd.kurikulum_sp';
    protected $primaryKey = 'a_digunakan';
    protected $fillable = [
    	'a_digunakan',		'id_creator',		'id_jenj_didik',		'id_kurikulum_sp',		'id_updater',		'jmlh_sks_lulus',		'jmlh_sks_pilihan',		'jmlh_sks_wajib',		'jmlh_smt_normal',		'nm_kurikulum_sp',		'soft_delete',
    ];
}
