<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MapAbmasTse extends AbstractionModel
{
    protected $table = 'pdrd.map_abmas_tse';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_litabmas',		'id_tse',		'id_updater',		'soft_delete',		'urutan3',
    ];
}
