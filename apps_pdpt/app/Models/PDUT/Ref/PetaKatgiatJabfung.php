<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class PetaKatgiatJabfung extends AbstractionModel
{
    protected $table = 'ref.peta_katgiat_jabfung';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jabfung',
    ];
}