<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MatkulKurikulum extends AbstractionModel
{
    protected $table = 'pdrd.matkul_kurikulum';
    protected $primaryKey = 'a_wajib';
    protected $fillable = [
    	'a_wajib',		'id_creator',		'id_kurikulum_sp',		'id_mk',		'id_updater',		'sks_mk',		'sks_prak',		'sks_prak_lap',		'sks_sim',		'sks_tm',		'smt',		'soft_delete',
    ];
}
