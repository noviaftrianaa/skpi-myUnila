<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class ProfilPt extends AbstractionModel
{
    protected $table = 'pdrd.profil_pt';
    protected $primaryKey = 'alasan_transfer_mhs';
    protected $fillable = [
    	'alasan_transfer_mhs',		'desk_singkat',		'eval_lulusan',		'id_creator',		'id_sp',		'id_thn_ajaran',		'id_updater',		'manfaat_tik',		'mekanisme_eval_lulusan',		'misi',		'peran_ajar',		'peran_suasana_akad',		'peran_susun_kur',		'pola_pimpin',		'renc_kembang_si',		'sasaran',		'sebar_info',		'seleksi_terima',		'sistem_jamin_mutu',		'sistem_kelola',		'soft_delete',		'tujuan',		'visi',
    ];
}
