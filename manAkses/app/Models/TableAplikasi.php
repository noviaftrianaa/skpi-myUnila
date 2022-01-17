<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableAplikasi extends Model
{
    protected $table = 'man_akses.table_aplikasi';
    protected $fillable = ['id_table_app','skema_tbl','nm_tbl','kode_primary','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;

    public function pengaturan_table_aplikasi()
    {   
    	return $this->belongsTo('App\Models\PengaturanTableAplikasi','id_table_app','id_table_app');
    }
}
