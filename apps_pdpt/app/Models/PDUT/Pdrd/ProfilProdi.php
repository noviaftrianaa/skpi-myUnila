<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class ProfilProdi extends AbstractionModel
{
    protected $table = 'pdrd.profil_prodi';
    protected $primaryKey = 'capaian_belajar';
    protected $fillable = [
    	'capaian_belajar',		'desk_singkat',		'frek_kur',		'himp_alumni',		'id_creator',		'id_sms',		'id_thn_ajaran',		'id_updater',		'keberlanjutan',		'kompetensi',		'laks_kur',		'misi',		'sasaran',		'soft_delete',		'tujuan',		'upaya_sebar',		'visi',
    ];
}
