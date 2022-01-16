<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisKepanitiaan extends Model
{
    protected $table = 'ref.jenis_kepanitiaan';
    protected $primaryKey = 'id_jns_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_panitia',	'nm_jns_panitia',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}