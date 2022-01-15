<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class ReMk extends AbstractionModel
{
    protected $table = 'pdrd.re_mk';
    protected $primaryKey = 'id_basis_evaluasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_basis_evaluasi',	'id_mk',	'komponen_evaluasi',	'desk_indo',	'desk_ing',	'bobot_evaluasi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}