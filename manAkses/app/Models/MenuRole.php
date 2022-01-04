<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuRole extends Model
{
    protected $table = 'man_akses.menu_role';
    protected $fillable = ['id_peran','id_menu','akses_menu','a_boleh_insert','a_boleh_show','a_boleh_delete','a_boleh_update','a_boleh_sanggah','approval_menu','tgl_create','last_update','soft_delete','last_sync','id_updater'];
    public $timestamps = false;
    public $incrementing = false;
}
