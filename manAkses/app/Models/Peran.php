<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peran extends Model
{
    protected $table = 'man_akses.peran';
    protected $primaryKey = 'id_peran';
    protected $fillable = ['nm_peran','a_perlu_sk','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;

    public function rolepengguna()
    {   
    	return $this->hasMany('App\Models\RolePengguna','id_peran');
    }

    public function menurole()
    {
        return $this->hasMany('App\Models\MenuRole','id_peran','id_peran');
    }
}
