<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class PetaKatgiatJnsdok extends AbstractionModel
{
    protected $table = 'ref.peta_katgiat_jnsdok';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jns_dok',	'a_wajib',	'no_urut',
    ];
}