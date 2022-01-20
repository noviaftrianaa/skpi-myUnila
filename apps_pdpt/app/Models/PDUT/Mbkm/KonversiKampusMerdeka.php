<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class KonversiKampusMerdeka extends Model
{
    protected $table = 'mbkm.konversi_kampus_merdeka';
    protected $primaryKey = 'id_konversi_aktivitas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_konversi_aktivitas',	'id_mk',	'id_ang_akt_mhs',	'id_akt_mhs',	'id_daftar_kampus_merdeka',	'nilai_angka',	'nilai_huruf',	'nilai_indeks',	'sks_mk',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}