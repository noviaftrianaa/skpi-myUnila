<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class MatkulKurikulum extends Model
{
    protected $table = 'pdrd.matkul_kurikulum';
    protected $primaryKey = 'id_kurikulum_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kurikulum_sp',	'id_mk',	'smt',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'a_wajib',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}