<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class SubstansiKuliah extends AbstractionModel
{
    protected $table = 'pdrd.substansi_kuliah';
    protected $primaryKey = 'id_subst';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_subst',	'id_jns_subst',	'nm_subst',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'id_creator',	'id_updater',	'soft_delete',
    ];
}