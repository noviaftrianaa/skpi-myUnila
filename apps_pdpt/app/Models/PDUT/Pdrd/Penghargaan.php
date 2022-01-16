<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Penghargaan extends AbstractionModel
{
    protected $table = 'pdrd.penghargaan';
    protected $primaryKey = 'id_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghargaan',	'id_sdm',	'id_jns_penghargaan',	'id_tkt_penghargaan',	'id_katgiat',	'nm_penghargaan',	'tgl_penghargaan',	'thn_penghargaan',	'instansi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}