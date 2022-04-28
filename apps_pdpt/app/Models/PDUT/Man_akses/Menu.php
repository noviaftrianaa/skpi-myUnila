<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'man_akses.menu';
    protected $primaryKey = 'id_menu';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_menu',	'nm_menu',	'nm_file',	'urutan_menu',	'a_aktif',	'a_tampil',	'icon',	'level_menu',	'id_aplikasi',	'id_group_menu',	'tgl_create',	'last_update',	'expired_date',	'last_sync',
    ];
}