<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Tunjangan extends AbstractionModel
{
    protected $table = 'pdrd.tunjangan';
    protected $primaryKey = 'dari_thn';
    protected $fillable = [
    	'dari_thn',		'id_creator',		'id_jns_tunj',		'id_sdm',		'id_tunj',		'id_updater',		'instansi',		'nm_tunj',		'nominal',		'sampai_thn',		'soft_delete',		'stat',		'sumber_dana',
    ];
}
