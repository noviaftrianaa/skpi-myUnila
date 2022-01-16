<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class ProfilProdi extends AbstractionModel
{
    protected $table = 'pdrd.profil_prodi';
    protected $primaryKey = 'id_thn_ajaran';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_thn_ajaran',	'id_sms',	'desk_singkat',	'visi',	'misi',	'tujuan',	'sasaran',	'kompetensi',	'capaian_belajar',	'upaya_sebar',	'keberlanjutan',	'frek_kur',	'laks_kur',	'himp_alumni',	'id_creator',	'id_updater',	'soft_delete',
    ];
}