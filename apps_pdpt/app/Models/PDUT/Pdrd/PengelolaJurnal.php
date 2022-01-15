<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class PengelolaJurnal extends AbstractionModel
{
    protected $table = 'pdrd.pengelola_jurnal';
    protected $primaryKey = 'id_kelola_jurnal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kelola_jurnal',	'id_media_pub',	'id_sdm',	'id_katgiat',	'peran',	'sk_tugas',	'tmt_sk_tugas',	'tst_sk_tugas',	'a_aktif',	'id_creator',	'id_updater',	'soft_delete',
    ];
}