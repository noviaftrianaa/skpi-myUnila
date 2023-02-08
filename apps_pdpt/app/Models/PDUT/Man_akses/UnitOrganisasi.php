<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class UnitOrganisasi extends Model
{
    protected $table = 'man_akses.unit_organisasi';
    protected $primaryKey = 'id_organisasi';
    protected $keyType = 'string';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_organisasi',
	'nm_lemb',
	'jln',
	'rt',
	'rw',
	'nm_dsn',
	'ds_kel',
	'kode_pos',
	'lintang',
	'bujur',
	'no_tel',
	'no_fax',
	'email',
	'website',
	'kd_kl',
	'kd_satker',
	'level_organisasi',
	'id_lembaga_asal',
	'a_aktif',
	'id_jns_lemb',
	'id_induk_organisasi',
	'id_wil',
	'tgl_create',
	'last_update',
	'soft_delete',
	'last_sync',
	'id_updater',
    ];

    protected $hidden = [
        'jln',
        'rt',
        'rw',
        'nm_dsn',
        'ds_kel',
        'kode_pos',
        'lintang',
        'bujur',
        'no_tel',
        'no_fax',
        'email',
        'website',
        'kd_kl',
        'kd_satker',
        'id_induk_organisasi',
        'id_wil',
        'tgl_create',
        'last_update',
        'soft_delete',
        'id_updater',
        'last_sync'
    ];
}
