<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class PengelolaJurnal extends AbstractionModel
{
    protected $table = 'pdrd.pengelola_jurnal';
    protected $primaryKey = 'a_aktif';
    protected $fillable = [
    	'a_aktif',		'id_creator',		'id_katgiat',		'id_kelola_jurnal',		'id_media_pub',		'id_sdm',		'id_updater',		'peran',		'sk_tugas',		'soft_delete',		'tmt_sk_tugas',		'tst_sk_tugas',
    ];
}
