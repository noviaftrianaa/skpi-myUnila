<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RwyPekerjaan extends Model
{
    protected $table = 'pdrd.rwy_pekerjaan';
    protected $primaryKey = 'id_rwy_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_kerja',	'id_sdm',	'id_dudi',	'id_pekerjaan',	'id_kbli',	'nm_jabatan',	'deskripsi_kerja',	'instansi',	'divisi',	'mulai_bekerja',	'selesai_bekerja',	'a_ln',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}