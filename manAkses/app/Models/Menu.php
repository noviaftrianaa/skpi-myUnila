<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'man_akses.menu';
    protected $primaryKey = 'id_menu';
    protected $fillable = ['nm_menu','nm_file','urutan_menu','a_aktif','a_tampil','icon','level_menu','id_aplikasi','id_group_menu','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;
}
