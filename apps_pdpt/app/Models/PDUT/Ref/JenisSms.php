<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisSms extends AbstractionModel
{
    protected $table = 'ref.jenis_sms';
    protected $primaryKey = 'id_jns_sms';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sms',	'nm_jns_sms',
    ];
}