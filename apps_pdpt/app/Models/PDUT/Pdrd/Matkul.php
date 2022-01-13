<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Matkul extends AbstractionModel
{
    protected $table = 'pdrd.matkul';
    protected $primaryKey = 'a_bahan_ajar';
    protected $fillable = [
    	'a_bahan_ajar',		'a_diktat',		'a_sap',		'a_silabus',		'acara_prak',		'id_creator',		'id_jenj_didik',		'id_mk',		'id_sms',		'id_updater',		'jns_mk',		'kel_mk',		'kode_mk',		'metode_pelaksanaan_kuliah',		'nm_mk',		'sks_mk',		'sks_prak',		'sks_prak_lap',		'sks_sim',		'sks_tm',		'soft_delete',		'tgl_akhir_efektif',		'tgl_mulai_efektif',
    ];
}
