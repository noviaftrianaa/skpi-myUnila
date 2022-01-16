<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisSarana extends Model
{
    protected $table = 'ref.jenis_sarana';
    protected $primaryKey = 'id_jns_sarana';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sarana',	'nm_jns_sarana',	'kel',	'a_penempatan',	'ket',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}