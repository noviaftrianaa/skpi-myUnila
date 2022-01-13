<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Diklat extends AbstractionModel
{
    protected $table = 'pdrd.diklat';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_diklat',		'id_jns_diklat',		'id_katgiat',		'id_kel_bidang',		'id_sdm',		'id_updater',		'jml_jam',		'nm_diklat',		'no_sert',		'penyelenggara',		'peran',		'sk_tugas',		'soft_delete',		'tempat',		'tgl_mulai',		'tgl_selesai',		'tgl_sert',		'tgl_sk_tugas',		'thn',		'tkt',
    ];
}
