<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class AksesTableAplikasi extends Model
{
    protected $table = 'man_akses.akses_table_aplikasi';
    protected $primaryKey = 'id_akses_table_app';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akses_table_app',	'id_table_app',	'id_aplikasi',	'a_boleh_get',	'a_boleh_insert',	'a_boleh_update',	'a_boleh_show',	'a_boleh_delete',	'a_aktif',	'tgl_create',	'last_update',	'soft_delete',	'last_sync',	'id_updater',
    ];
}