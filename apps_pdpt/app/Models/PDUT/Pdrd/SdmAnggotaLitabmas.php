<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class SdmAnggotaLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.sdm_anggota_litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_litabmas',
	'id_sdm',
	'id_katgiat',
	'peran_litabmas',
	'stat_aktif',
	'id_creator',
	'id_updater',
	'soft_delete',

    ];
}