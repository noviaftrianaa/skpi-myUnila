<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisTunjangan extends Model
{
    protected $table = 'ref.jenis_tunjangan';
    protected $primaryKey = 'id_jns_tunj';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tunj',	'nm_jns_tunj',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}