<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class LogBookMbkm extends Model
{
    protected $table = 'mbkm.log_book_mbkm';
    protected $primaryKey = 'id_log_book_mbkm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_log_book_mbkm',	'id_mk_konversi',	'nm_verifikator',	'wkt_selesai_ver',	'ket_periksa',	'judul_log_book',	'aktivitas_kegiatan',	'lokasi_kegiatan',	'tgl_kegiatan',	'stat_ajuan',	'wkt_ajuan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}