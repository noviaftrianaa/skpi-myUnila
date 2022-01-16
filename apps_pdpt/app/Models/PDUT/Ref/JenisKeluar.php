<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisKeluar extends Model
{
    protected $table = 'ref.jenis_keluar';
    protected $primaryKey = 'id_jns_keluar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_keluar',	'ket_keluar',	'a_pd',	'a_ptk',	'a_sdm_iptek',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}