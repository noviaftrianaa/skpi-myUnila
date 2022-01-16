<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class MatkulKurikulum extends AbstractionModel
{
    protected $table = 'pdrd.matkul_kurikulum';
    protected $primaryKey = 'id_kurikulum_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kurikulum_sp',	'id_mk',	'smt',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'a_wajib',	'id_creator',	'id_updater',	'soft_delete',
    ];
}