<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class PeriodeKampusMerdeka extends Model
{
    protected $table = 'mbkm.periode_kampus_merdeka';
    protected $primaryKey = 'id_periode_mbkm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_periode_mbkm',	'id_smt',	'id_jns_akt_mhs',	'nm_periode_mbkm',	'nm_penyelenggara',	'waktu_mulai',	'waktu_selesai',	'a_aktif',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}