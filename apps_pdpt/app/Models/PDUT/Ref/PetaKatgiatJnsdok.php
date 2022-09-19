<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class PetaKatgiatJnsdok extends Model
{
    protected $table = 'ref.peta_katgiat_jnsdok';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jns_dok',	'a_wajib',	'no_urut',	'create_date',	'last_update',
    ];
}