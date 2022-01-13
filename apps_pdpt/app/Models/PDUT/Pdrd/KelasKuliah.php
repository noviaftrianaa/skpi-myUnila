<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KelasKuliah extends AbstractionModel
{
    protected $table = 'pdrd.kelas_kuliah';
    protected $primaryKey = 'a_pengguna_pditt';
    protected $fillable = [
    	'a_pengguna_pditt',		'a_selenggara_pditt',		'bahasan_case',		'id_creator',		'id_kls',		'id_mk',		'id_sms',		'id_smt',		'id_updater',		'kuota_pditt',		'nm_kls',		'sks_mk',		'sks_prak',		'sks_prak_lap',		'sks_sim',		'sks_tm',		'soft_delete',
    ];
}
