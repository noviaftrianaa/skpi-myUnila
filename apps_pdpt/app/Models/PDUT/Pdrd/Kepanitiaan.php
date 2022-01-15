<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Kepanitiaan extends AbstractionModel
{
    protected $table = 'pdrd.kepanitiaan';
    protected $primaryKey = 'id_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_panitia',	'id_jns_panitia',	'nm_panitia',	'instansi',	'tkt_panitia',	'sk_tugas',	'tmt_sk_tugas',	'tst_sk_tugas',	'id_creator',	'id_updater',	'soft_delete',
    ];
}