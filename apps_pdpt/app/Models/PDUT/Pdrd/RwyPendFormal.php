<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwyPendFormal extends AbstractionModel
{
    protected $table = 'pdrd.rwy_pend_formal';
    protected $primaryKey = 'a_kependidikan';
    protected $fillable = [
    	'a_kependidikan',		'fak',		'id_bid_studi',		'id_creator',		'id_gelar_akad',		'id_jenj_didik',		'id_katgiat',		'id_rwy_didik_formal',		'id_sdm',		'id_sms',		'id_updater',		'ipk',		'judul_tesis',		'nipd',		'nm_sp_formal',		'no_ijazah',		'sk_setara',		'sks_lulus',		'smt',		'soft_delete',		'stat_kul',		'tgl_lulus',		'tgl_sk_setara',		'thn_lulus',		'thn_masuk',
    ];
}
