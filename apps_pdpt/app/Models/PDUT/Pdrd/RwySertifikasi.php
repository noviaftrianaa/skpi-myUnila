<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RwySertifikasi extends AbstractionModel
{
    protected $table = 'pdrd.rwy_sertifikasi';
    protected $primaryKey = 'id_rwy_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_sert',	'id_jns_sert',	'id_bid_studi',	'id_sdm',	'thn_sert',	'sk_sert',	'nrg',	'no_peserta',	'id_creator',	'id_updater',	'soft_delete',
    ];
}