<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Inpassing extends AbstractionModel
{
    protected $table = 'pdrd.inpassing';
    protected $primaryKey = 'angka_kredit';
    protected $fillable = [
    	'angka_kredit',		'id_creator',		'id_inpassing',		'id_pangkat_gol',		'id_sdm',		'id_updater',		'masa_kerja_bln',		'masa_kerja_thn',		'sk_inpassing',		'soft_delete',		'tgl_sk_inpassing',		'tmt_sk_inpassing',
    ];
}
