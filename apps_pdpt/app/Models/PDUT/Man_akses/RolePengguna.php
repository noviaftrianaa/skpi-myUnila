<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class RolePengguna extends Model
{
    protected $table = 'man_akses.role_pengguna';
    protected $primaryKey = 'id_role_pengguna';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_role_pengguna',	'id_pengguna',	'id_organisasi',	'id_peran',	'sk_penugasan',	'tgl_sk_penugasan',	'approval_peran',	'tgl_kadarluasa',	'last_active',	'tgl_create',	'last_update',	'soft_delete',	'last_sync',	'id_updater',
    ];
}