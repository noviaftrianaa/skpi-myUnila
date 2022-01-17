<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RwySertifikasi extends Model
{
    protected $table = 'pdrd.rwy_sertifikasi';
    protected $primaryKey = 'id_rwy_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_sert',	'id_jns_sert',	'id_bid_studi',	'id_sdm',	'thn_sert',	'sk_sert',	'nrg',	'no_peserta',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}