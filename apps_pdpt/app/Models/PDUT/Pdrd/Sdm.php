<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Sdm extends AbstractionModel
{
    protected $table = 'pdrd.sdm';
    protected $primaryKey = 'akta_ijin_ajar';
    protected $fillable = [
    	'akta_ijin_ajar',		'email',		'id_agama',		'id_creator',		'id_jns_sdm',		'id_keahlian_lab',		'id_lemb_angkat',		'id_pekerjaan_suami_istri',		'id_sdm',		'id_stat_aktif',		'id_updater',		'id_wil',		'jk',		'kewarganegaraan',		'nidn',		'nik',		'nip',		'nip_suami_istri',		'nira',		'niy_nigk',		'nm_sdm',		'nm_suami_istri',		'nm_wp',		'no_hp',		'no_tel_rmh',		'npwp',		'nsdmi',		'nuptk',		'sk_angkat',		'sk_cpns',		'soft_delete',		'stat_data',		'stat_kawin',		'tgl_lahir',		'tgl_sk_cpns',		'tmpt_lahir',		'tmt_pns',		'tmt_sk_angkat',
    ];
}
