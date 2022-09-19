<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisSms extends Model
{
    protected $table = 'ref.jenis_sms';
    protected $primaryKey = 'id_jns_sms';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sms',	'nm_jns_sms',	'create_date',	'last_update',
    ];
}