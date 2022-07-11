<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableAplikasi extends Model
{
    protected $table = 'man_akses.table_aplikasi';
    protected $keyType = 'string';
    protected $primaryKey = 'id_table_app';
    protected $fillable = ['id_table_app','skema_tbl','nm_tbl','tabel_alias','sync_type','sync_seq','kolom_kecuali','table_status','table_ket','jml_thread','baris_per_thread','order_ekstra','a_table_aktif','kode_primary','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;

    public function akses_table_aplikasi()
    {   
    	return $this->belongsTo('App\Models\AksesTableAplikasi','id_table_app','id_table_app');
    }
}
