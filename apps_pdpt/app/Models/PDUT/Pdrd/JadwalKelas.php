<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class JadwalKelas extends AbstractionModel
{
    protected $table = 'pdrd.jadwal_kelas';
    protected $primaryKey = 'id_jdwl_kls';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jdwl_kls',	'id_kls',	'id_smt',	'pertemuan',	'tgl_jadwal',	'waktu_mulai',	'waktu_selesai',	'lokasi',	'status',	'id_creator',	'id_updater',	'soft_delete',
    ];
}