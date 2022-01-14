<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class NilaiSmtMhs extends AbstractionModel
{
    protected $table = 'pdrd.nilai_smt_mhs';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_kls',		'id_reg_ptk',		'id_updater',		'nilai_angka',		'nilai_huruf',		'nilai_indeks',		'soft_delete',
    ];
}
