<?php

namespace App\Models\ManAkses;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePengguna extends Model
{
    protected $table = 'man_akses.role_pengguna';
    protected $primaryKey = 'id_role_pengguna';
    public $timestamps = false;
    public $incrementing = false;

    protected $hidden = [
        'tgl_create',
        'last_update',
        'soft_delete',
        'id_updater',
        'last_sync'
    ];

    protected $fillable = ['id_role_pengguna','id_pengguna','id_organisasi','id_peran','sk_penugasan','tgl_sk_penugasan','approval_peran','tgl_kadaluarsa','last_active','tgl_create','last_update','soft_delete','last_sync','id_updater'];
     public function peran()
     {
     	return $this->belongsTo('App\Models\PDUT\Man_akses\Peran','id_peran','id_peran');
     }

     public function user()
     {
         return $this->belongsTo('App\Models\PDUT\Man_akses\Pengguna','id_pengguna','id_pengguna');
     }

     public function unitorganisasi()
     {
         return $this->belongsTo('App\Models\PDUT\Man_akses\UnitOrganisasi','id_organisasi','id_organisasi');
     }
}
