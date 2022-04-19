<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class MenuRole extends Model
{
    protected $table = 'man_akses.menu_role';
    protected $primaryKey = 'id_peran';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_peran',	'id_menu',	'akses_menu',	'a_boleh_insert',	'a_boleh_show',	'a_boleh_delete',	'a_boleh_update',	'a_boleh_sanggah',	'approval_menu',	'tgl_create',	'last_update',	'soft_delete',	'last_sync',	'id_updater',
    ];
}