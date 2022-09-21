<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class PetaKatgiatJabfung extends Model
{
    protected $table = 'ref.peta_katgiat_jabfung';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_jabfung',	'create_date',	'last_update',
    ];
}