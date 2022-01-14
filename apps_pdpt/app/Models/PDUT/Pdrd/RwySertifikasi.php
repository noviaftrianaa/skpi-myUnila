<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RwySertifikasi extends AbstractionModel
{
    protected $table = 'pdrd.rwy_sertifikasi';
    protected $primaryKey = 'id_bid_studi';
    protected $fillable = [
    	'id_bid_studi',		'id_creator',		'id_jns_sert',		'id_rwy_sert',		'id_sdm',		'id_updater',		'no_peserta',		'nrg',		'sk_sert',		'soft_delete',		'thn_sert',
    ];
}
