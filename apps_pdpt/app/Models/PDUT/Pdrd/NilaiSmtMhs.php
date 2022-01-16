<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class NilaiSmtMhs extends AbstractionModel
{
    protected $table = 'pdrd.nilai_smt_mhs';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',	'id_kls',	'nilai_angka',	'nilai_huruf',	'nilai_indeks',	'id_creator',	'id_updater',	'soft_delete',
    ];
}