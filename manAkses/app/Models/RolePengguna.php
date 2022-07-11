<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePengguna extends Model
{
    protected $table = 'man_akses.role_pengguna';
    protected $keyType = 'string';
    protected $primaryKey = 'id_role_pengguna';
    protected $fillable = ['id_role_pengguna','id_pengguna','id_organisasi','id_peran','sk_penugasan','tgl_sk_penugasan','approval_peran','tgl_kadaluarsa','last_active','tgl_create','last_update','soft_delete','last_sync','id_updater'];
    public $timestamps = false;
    public $incrementing = false;

    public function peran()
    {   
    	return $this->belongsTo('App\Models\Peran','id_peran','id_peran');
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User','id_pengguna','id_pengguna');
    }

    public function unitorganisasi()
    {
        return $this->belongsTo('App\Models\UnitOrganisasi','id_organisasi','id_organisasi');
    }
}
