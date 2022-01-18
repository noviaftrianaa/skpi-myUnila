<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaturanTableAplikasi extends Model
{
    protected $table = 'man_akses.pengaturan_table_aplikasi';
    protected $fillable = ['id_pengaturan_table_app','id_table_app','id_aplikasi','a_enable','a_boleh_insert','a_boleh_show','a_boleh_delete','a_boleh_update','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;

    public function table_aplikasi()
    {   
    	return $this->belongsTo('App\Models\TableAplikasi','id_table_app','id_table_app');
    }

    public function aplikasi()
    {   
    	return $this->belongsTo('App\Models\Aplikasi','id_aplikasi','id_aplikasi');
    }
}
