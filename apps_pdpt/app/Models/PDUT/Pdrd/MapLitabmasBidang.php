<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MapLitabmasBidang extends AbstractionModel
{
    protected $table = 'pdrd.map_litabmas_bidang';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_kel_bidang',		'id_litabmas',		'id_updater',		'soft_delete',		'urutan2',
    ];
}
