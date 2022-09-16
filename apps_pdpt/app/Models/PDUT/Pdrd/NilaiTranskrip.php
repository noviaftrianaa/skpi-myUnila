<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class NilaiTranskrip extends Model
{
    protected $table = 'pdrd.nilai_transkrip';
    protected $primaryKey = 'id_reg_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_pd',	'id_mk',	'id_kls',	'id_konversi_aktivitas',	'id_ekuivalensi',	'nilai_angka',	'nilai_huruf',	'nilai_indeks',	'smt_ke',	'sks_mk',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}