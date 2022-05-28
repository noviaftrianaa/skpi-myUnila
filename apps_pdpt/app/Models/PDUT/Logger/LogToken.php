<?php

namespace App\Models\PDUT\Logger;

use Illuminate\Database\Eloquent\Model;

class LogToken extends Model
{
    protected $table = 'logger.log_token';
    protected $primaryKey = 'id_token';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_token',	'keterangan',	'user',	'accessed_uri',	'wkt_create',	'wkt_update',	'waktu_logout',	'waktu_timeout',
    ];
}