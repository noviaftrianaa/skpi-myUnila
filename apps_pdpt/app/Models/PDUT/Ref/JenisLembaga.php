<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisLembaga extends Model
{
    protected $table = 'ref.jenis_lembaga';
    protected $primaryKey = 'id_jns_lemb';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_lemb',	'nm_jns_lemb',	'a_sp',	'a_lemb_akred',	'a_pengelola_pendidikan',	'a_sms',	'a_tmpt_pengawas',	'a_lemb_iptek',	'a_smi',	'sort',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}