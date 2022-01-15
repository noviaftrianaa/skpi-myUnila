<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class PetaKatgiatJnspub extends AbstractionModel
{
    protected $table = 'ref.peta_katgiat_jnspub';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jns_pub',
    ];
}