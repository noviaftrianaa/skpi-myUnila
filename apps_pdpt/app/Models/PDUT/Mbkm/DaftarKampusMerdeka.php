<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class DaftarKampusMerdeka extends Model
{
    protected $table = 'mbkm.daftar_kampus_merdeka';
    protected $primaryKey = 'id_daftar_kampus_merdeka';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_daftar_kampus_merdeka',	'id_periode_mbkm',	'id_reg_pd',	'id_sp',	'lokasi_mbkm',	'nm_pd',	'nipd',	'a_diluar_pt',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}