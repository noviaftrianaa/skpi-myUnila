<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisDokumen extends Model
{
    protected $table = 'ref.jenis_dokumen';
    protected $primaryKey = 'id_jns_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_dok',	'nm_jns_dok',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}