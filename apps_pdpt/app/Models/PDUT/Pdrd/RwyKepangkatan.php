<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RwyKepangkatan extends Model
{
    protected $table = 'pdrd.rwy_kepangkatan';
    protected $primaryKey = 'id_rwy_pangkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_pangkat',	'id_sdm',	'id_pangkat_gol',	'sk_pangkat',	'tgl_sk_pangkat',	'tmt_sk_pangkat',	'masa_kerja_gol_thn',	'masa_kerja_gol_bln',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}