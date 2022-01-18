<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aplikasi extends Model
{
    protected $table = 'man_akses.aplikasi';
    protected $fillable = ['id_aplikasi','id_organisasi','nm_aplikasi','ket_aplikasi','token_aplikasi','app_key','url','a_generate_menu','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;

    public function unitorganisasi()
    {   
    	return $this->belongsTo('App\Models\UnitOrganisasi','id_organisasi','id_organisasi');
    }

    public function pjaplikasi()
    {
        return $this->hasMany('App\Models\PJAplikasi','id_aplikasi','id_aplikasi');
    }

    public function pengaturan_table_aplikasi()
    {   
    	return $this->hasMany('App\Models\PengaturanTableAplikasi','id_aplikasi','id_aplikasi');
    }
}
