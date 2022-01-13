<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class ReMk extends AbstractionModel
{
    protected $table = 'pdrd.re_mk';
    protected $primaryKey = 'bobot_evaluasi';
    protected $fillable = [
    	'bobot_evaluasi',		'desk_indo',		'desk_ing',		'id_basis_evaluasi',		'id_creator',		'id_mk',		'id_updater',		'komponen_evaluasi',		'soft_delete',
    ];
}
