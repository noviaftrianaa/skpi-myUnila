<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RegPtk extends AbstractionModel
{
    protected $table = 'pdrd.reg_ptk';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_ikatan_kerja',		'id_jns_keluar',		'id_reg_ptk',		'id_sdm',		'id_sms',		'id_sp',		'id_stat_pegawai',		'id_updater',		'nidn',		'no_srt_tgs',		'soft_delete',		'tgl_ptk_keluar',		'tgl_srt_tgs',		'tmt_srt_tgs',
    ];
}
