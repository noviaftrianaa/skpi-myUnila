<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Sdm extends AbstractionModel
{
    protected $table = 'pdrd.sdm';
    protected $primaryKey = 'id_sdm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sdm',
	'nm_sdm',
	'jk',
	'tmpt_lahir',
	'tgl_lahir',
	'nik',
	'niy_nigk',
	'nuptk',
	'nidn',
	'nsdmi',
	'stat_kawin',
	'jln',
	'rt',
	'rw',
	'nm_dsn',
	'ds_kel',
	'kode_pos',
	'no_tel_rmh',
	'no_hp',
	'email',
	'nip',
	'tmt_pns',
	'nm_suami_istri',
	'nip_suami_istri',
	'sk_cpns',
	'tgl_sk_cpns',
	'sk_angkat',
	'tmt_sk_angkat',
	'npwp',
	'nm_wp',
	'stat_data',
	'akta_ijin_ajar',
	'nira',
	'kewarganegaraan',
	'id_jns_sdm',
	'id_wil',
	'id_stat_aktif',
	'id_agama',
	'id_keahlian_lab',
	'id_pekerjaan_suami_istri',
	'id_lemb_angkat',
	'id_sumber_gaji',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
