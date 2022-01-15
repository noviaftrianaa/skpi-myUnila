<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Diklat extends AbstractionModel
{
    protected $table = 'pdrd.diklat';
    protected $primaryKey = 'id_diklat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_diklat',	'id_sdm',	'id_kel_bidang',	'id_katgiat',	'id_jns_diklat',	'nm_diklat',	'penyelenggara',	'thn',	'peran',	'tkt',	'jml_jam',	'no_sert',	'tgl_sert',	'tempat',	'tgl_mulai',	'tgl_selesai',	'sk_tugas',	'tgl_sk_tugas',	'id_creator',	'id_updater',	'soft_delete',
    ];
}