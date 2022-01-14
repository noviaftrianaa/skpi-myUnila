<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AnggotaPanitia extends AbstractionModel
{
    protected $table = 'pdrd.anggota_panitia';
    protected $primaryKey = 'id_ang_panitia';
    protected $fillable = [
    	'id_ang_panitia',		'id_creator',		'id_katgiat',		'id_panitia',		'id_sdm',		'id_updater',		'peran',		'soft_delete',
    ];
}
