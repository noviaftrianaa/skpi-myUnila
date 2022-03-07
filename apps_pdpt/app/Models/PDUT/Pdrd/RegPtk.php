<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RegPtk extends AbstractionModel
{
    protected $table = 'pdrd.reg_ptk';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',
	'id_jns_keluar',
	'id_sdm',
	'id_sp',
	'id_stat_pegawai',
	'id_ikatan_kerja',
	'id_sms',
	'no_srt_tgs',
	'tgl_srt_tgs',
	'tmt_srt_tgs',
	'tgl_ptk_keluar',
	'nidn',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
