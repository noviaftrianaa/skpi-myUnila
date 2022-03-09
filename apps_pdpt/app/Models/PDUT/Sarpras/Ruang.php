<?php

namespace App\Models\PDUT\Sarpras;

use Illuminate\Database\Eloquent\Model;

class Ruang extends Model
{
    protected $table = 'sarpras.ruang';
    protected $primaryKey = 'id_ruang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ruang',	'id_sms',	'kd_satuan',	'kode_ruang',	'nama_ruang',	'lantai',	'kapasitas',	'luas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}