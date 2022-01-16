<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RwyPekerjaan extends AbstractionModel
{
    protected $table = 'pdrd.rwy_pekerjaan';
    protected $primaryKey = 'id_rwy_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_kerja',	'id_sdm',	'id_dudi',	'id_pekerjaan',	'id_kbli',	'nm_jabatan',	'deskripsi_kerja',	'instansi',	'divisi',	'mulai_bekerja',	'selesai_bekerja',	'a_ln',	'id_creator',	'id_updater',	'soft_delete',
    ];
}