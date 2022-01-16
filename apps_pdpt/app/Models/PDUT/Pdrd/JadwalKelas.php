<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class JadwalKelas extends Model
{
    protected $table = 'pdrd.jadwal_kelas';
    protected $primaryKey = 'id_jdwl_kls';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jdwl_kls',	'id_kls',	'id_smt',	'pertemuan',	'tgl_jadwal',	'waktu_mulai',	'waktu_selesai',	'lokasi',	'status',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}