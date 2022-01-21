<?php

namespace App\Models\PDUT\Keuangan;

use Illuminate\Database\Eloquent\Model;

class RwyGajiBerkala extends Model
{
    protected $table = 'keuangan.rwy_gaji_berkala';
    protected $primaryKey = 'id_rwy_gaji_berkala';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_gaji_berkala',	'id_sdm',	'id_pangkat_gol',	'sk_gaji_berkala',	'tgl_sk_gaji_berkala',	'tmt_kgb',	'masa_kerja_thn',	'masa_kerja_bln',	'gaji_pokok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}