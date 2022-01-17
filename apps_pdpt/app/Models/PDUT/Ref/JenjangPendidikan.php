<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenjangPendidikan extends Model
{
    protected $table = 'ref.jenjang_pendidikan';
    protected $primaryKey = 'id_jenj_didik';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jenj_didik',	'nm_jenj_didik',	'u_jenj_lemb',	'u_jenj_org',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}