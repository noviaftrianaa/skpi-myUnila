<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class SubstansiKuliah extends Model
{
    protected $table = 'pdrd.substansi_kuliah';
    protected $primaryKey = 'id_subst';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_subst',	'id_jns_subst',	'nm_subst',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}