<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class PjAplikasi extends Model
{
    protected $table = 'man_akses.pj_aplikasi';
    protected $primaryKey = 'id_pj_aplikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pj_aplikasi',	'id_pengguna',	'id_aplikasi',	'nm_pj',	'jabatan_pj',	'no_hp',	'email',	'a_masih',	'wkt_selesai',	'tgl_create',	'last_update',	'soft_delete',	'last_sync',	'id_updater',
    ];
}