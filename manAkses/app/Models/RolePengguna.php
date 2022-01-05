<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePengguna extends Model
{
    protected $table = 'man_akses.role_pengguna';
    protected $primaryKey = 'id_role_pengguna';
    protected $fillable = ['id_pengguna','id_organisasi','id_peran','sk_penugasan','tgl_sk_penugasan','approval_peran','tgl_kadaluarsa','last_active','tgl_create','last_update','soft_delete','last_sync','id_updater'];
    public $timestamps = false;
    public $incrementing = false;
}
