<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class Aplikasi extends Model
{
    protected $table = 'man_akses.aplikasi';
    protected $primaryKey = 'id_aplikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_aplikasi',	'id_blob',	'id_organisasi',	'nm_aplikasi',	'ket_aplikasi',	'token_aplikasi',	'app_key',	'url',	'endpoint_ws',	'a_generate_menu',	'a_integrasi_cas',	'a_sistem_internal_pt',	'tgl_create',	'last_update',	'expired_date',	'last_sync',
    ];
}