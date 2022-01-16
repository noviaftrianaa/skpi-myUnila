<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class ProfilPt extends Model
{
    protected $table = 'pdrd.profil_pt';
    protected $primaryKey = 'id_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sp',	'id_thn_ajaran',	'desk_singkat',	'visi',	'misi',	'tujuan',	'sasaran',	'seleksi_terima',	'pola_pimpin',	'sistem_kelola',	'sistem_jamin_mutu',	'alasan_transfer_mhs',	'peran_ajar',	'peran_susun_kur',	'peran_suasana_akad',	'manfaat_tik',	'sebar_info',	'renc_kembang_si',	'eval_lulusan',	'mekanisme_eval_lulusan',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}