<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JadwalKelas extends AbstractionModel
{
    protected $table = 'pdrd.jadwal_kelas';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jdwl_kls',		'id_kls',		'id_smt',		'id_updater',		'lokasi',		'pertemuan',		'soft_delete',		'status',		'tgl_jadwal',		'waktu_mulai',		'waktu_selesai',
    ];
}
