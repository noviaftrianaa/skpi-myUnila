<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class TableAplikasi extends Model
{
    protected $table = 'man_akses.table_aplikasi';
    protected $primaryKey = 'id_table_app';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_table_app',	'skema_tbl',	'nm_tbl',	'tabel_alias',	'kode_primary',	'sync_type',	'sync_seq',	'kolom_kecuali',	'table_status',	'table_ket',	'jml_thread',	'baris_per_thread',	'order_ekstra',	'a_table_aktif',	'tgl_create',	'last_update',	'expired_date',	'last_sync',
    ];
}