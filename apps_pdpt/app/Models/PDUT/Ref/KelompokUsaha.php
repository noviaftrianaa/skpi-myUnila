<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KelompokUsaha extends Model
{
    protected $table = 'ref.kelompok_usaha';
    protected $primaryKey = 'id_kel_usaha';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_usaha',	'nm_kel_usaha',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}