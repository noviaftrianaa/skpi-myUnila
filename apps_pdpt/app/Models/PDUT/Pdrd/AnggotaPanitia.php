<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class AnggotaPanitia extends AbstractionModel
{
    protected $table = 'pdrd.anggota_panitia';
    protected $primaryKey = 'id_ang_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_panitia',	'id_panitia',	'id_sdm',	'id_katgiat',	'peran',	'id_creator',	'id_updater',	'soft_delete',
    ];
}