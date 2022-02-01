<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class ProfilProdi extends Model
{
    protected $table = 'pdrd.profil_prodi';
    protected $primaryKey = 'id_sms';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_thn_ajaran',
	'id_sms',
	'desk_singkat',
	'visi',
	'misi',
	'tujuan',
	'sasaran',
	'kompetensi',
	'capaian_belajar',
	'upaya_sebar',
	'keberlanjutan',
	'frek_kur',
	'laks_kur',
	'himp_alumni',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}