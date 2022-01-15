<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class TugasTambahan extends AbstractionModel
{
    protected $table = 'pdrd.tugas_tambahan';
    protected $primaryKey = 'id_tgs_tambah';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tgs_tambah',	'id_jab_tgs',	'id_sdm',	'id_katgiat',	'id_sms',	'id_sp',	'jml_jam',	'sk_tugas_tambah',	'tmt_sk_tambah',	'tst_sk_tambah',	'id_creator',	'id_updater',	'soft_delete',
    ];
}