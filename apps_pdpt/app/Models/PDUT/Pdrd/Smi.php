<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Smi extends AbstractionModel
{
    protected $table = 'pdrd.smi';
    protected $primaryKey = 'id_smi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_smi',	'singkatan',	'kode_smi',	'tgl_berdiri',	'sk_selenggara',	'tgl_sk_selenggara',	'tmt_sk_selenggara',	'tst_sk_selenggara',	'habis_masa_laku',	'id_creator',	'id_updater',	'soft_delete',
    ];
}