<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Matkul extends AbstractionModel
{
    protected $table = 'pdrd.matkul';
    protected $primaryKey = 'id_mk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_mk',	'id_sms',	'id_jenj_didik',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'kode_mk',	'nm_mk',	'jns_mk',	'kel_mk',	'metode_pelaksanaan_kuliah',	'a_sap',	'a_silabus',	'a_bahan_ajar',	'acara_prak',	'a_diktat',	'tgl_mulai_efektif',	'tgl_akhir_efektif',	'id_creator',	'id_updater',	'soft_delete',
    ];
}