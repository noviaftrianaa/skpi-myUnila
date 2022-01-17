<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class KelasKuliah extends Model
{
    protected $table = 'pdrd.kelas_kuliah';
    protected $primaryKey = 'id_kls';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kls',	'id_smt',	'id_sms',	'id_mk',	'sks_mk',	'sks_tm',	'sks_prak',	'sks_prak_lap',	'sks_sim',	'nm_kls',	'bahasan_case',	'a_selenggara_pditt',	'a_pengguna_pditt',	'kuota_pditt',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}