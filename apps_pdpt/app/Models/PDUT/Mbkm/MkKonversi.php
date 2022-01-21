<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class MkKonversi extends Model
{
    protected $table = 'mbkm.mk_konversi';
    protected $primaryKey = 'id_mk_konversi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_mk_konversi',	'id_sp',	'id_daftar_kampus_merdeka',	'nm_verifikator',	'wkt_selesai_ver',	'ket_periksa',	'nm_mk',	'kode_mk',	'sks_mk',	'stat_ajuan',	'wkt_ajuan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}