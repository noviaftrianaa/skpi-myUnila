<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class PetaKatgiatJnspub extends Model
{
    protected $table = 'ref.peta_katgiat_jnspub';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jns_pub',	'create_date',	'last_update',
    ];
}