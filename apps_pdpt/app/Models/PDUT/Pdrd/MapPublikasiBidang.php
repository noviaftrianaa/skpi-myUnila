<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MapPublikasiBidang extends AbstractionModel
{
    protected $table = 'pdrd.map_publikasi_bidang';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_kel_bidang',		'id_publikasi',		'id_updater',		'soft_delete',		'urutan',
    ];
}
