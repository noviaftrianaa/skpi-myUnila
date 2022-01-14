<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Penghargaan extends AbstractionModel
{
    protected $table = 'pdrd.penghargaan';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jns_penghargaan',		'id_katgiat',		'id_penghargaan',		'id_sdm',		'id_tkt_penghargaan',		'id_updater',		'instansi',		'nm_penghargaan',		'soft_delete',		'tgl_penghargaan',		'thn_penghargaan',
    ];
}
