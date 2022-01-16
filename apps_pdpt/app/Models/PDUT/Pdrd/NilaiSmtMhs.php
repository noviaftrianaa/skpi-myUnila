<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class NilaiSmtMhs extends Model
{
    protected $table = 'pdrd.nilai_smt_mhs';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',	'id_kls',	'nilai_angka',	'nilai_huruf',	'nilai_indeks',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}