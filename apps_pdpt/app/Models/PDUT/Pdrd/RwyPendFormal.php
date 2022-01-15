<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RwyPendFormal extends AbstractionModel
{
    protected $table = 'pdrd.rwy_pend_formal';
    protected $primaryKey = 'id_rwy_didik_formal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_didik_formal',	'id_sms',	'id_katgiat',	'id_sdm',	'id_jenj_didik',	'id_bid_studi',	'id_gelar_akad',	'nm_sp_formal',	'fak',	'a_kependidikan',	'thn_masuk',	'thn_lulus',	'nipd',	'stat_kul',	'smt',	'sks_lulus',	'ipk',	'sk_setara',	'tgl_sk_setara',	'no_ijazah',	'judul_tesis',	'tgl_lulus',	'id_creator',	'id_updater',	'soft_delete',
    ];
}