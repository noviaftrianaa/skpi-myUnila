<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisPrasarana extends Model
{
    protected $table = 'ref.jenis_prasarana';
    protected $primaryKey = 'id_jns_prasarana';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_prasarana',	'nm_jns_prasarana',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}