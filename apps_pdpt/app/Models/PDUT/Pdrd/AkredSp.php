<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class AkredSp extends AbstractionModel
{
    protected $table = 'pdrd.akred_sp';
    protected $primaryKey = 'id_akred_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akred_sp',	'id_lemb_akred',	'id_sp',	'id_akred',	'sk_akred_sp',	'tgl_sk_akred_sp',	'tst_sk_akred_sp',	'asal_data',	'id_creator',	'id_updater',	'soft_delete',
    ];
}