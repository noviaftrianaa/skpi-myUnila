<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MitraLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.mitra_litabmas';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_dudi',		'id_litabmas',		'id_updater',		'soft_delete',
    ];
}
