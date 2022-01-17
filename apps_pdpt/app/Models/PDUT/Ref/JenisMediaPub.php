<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisMediaPub extends Model
{
    protected $table = 'ref.jenis_media_pub';
    protected $primaryKey = 'id_jns_media';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_media',	'nm_jns_media',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}