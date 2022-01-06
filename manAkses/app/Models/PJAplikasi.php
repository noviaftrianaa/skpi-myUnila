<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PJAplikasi extends Model
{
    protected $table = 'man_akses.pj_aplikasi';
    protected $primaryKey = 'id_pj_aplikasi';
    protected $fillable = ['id_pengguna','id_aplikasi','nm_pj','jabatan_pj','no_hp','email','a_masih','wkt_selesai','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo('App\Models\User','id_pengguna','id_pengguna');
    }

    public function aplikasi()
    {
        return $this->belongsTo('App\Models\Aplikasi','id_aplikasi','id_aplikasi');
    }
}
