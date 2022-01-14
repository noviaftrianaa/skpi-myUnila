<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class SubstansiKuliah extends AbstractionModel
{
    protected $table = 'pdrd.substansi_kuliah';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jns_subst',		'id_subst',		'id_updater',		'nm_subst',		'sks_mk',		'sks_prak',		'sks_prak_lap',		'sks_sim',		'sks_tm',		'soft_delete',
    ];
}
