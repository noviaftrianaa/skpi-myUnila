<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class NilaiAkred extends Model
{
    protected $table = 'ref.nilai_akred';
    protected $primaryKey = 'id_akred';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akred',	'nm_akred',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}