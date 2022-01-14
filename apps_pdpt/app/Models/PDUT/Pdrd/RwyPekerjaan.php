<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyPekerjaan extends AbstractionModel
{
    protected $table = 'pdrd.rwy_pekerjaan';
    protected $primaryKey = 'a_ln';
    protected $fillable = [
    	'a_ln',		'deskripsi_kerja',		'divisi',		'id_creator',		'id_dudi',		'id_kbli',		'id_pekerjaan',		'id_rwy_kerja',		'id_sdm',		'id_updater',		'instansi',		'mulai_bekerja',		'nm_jabatan',		'selesai_bekerja',		'soft_delete',
    ];
}
