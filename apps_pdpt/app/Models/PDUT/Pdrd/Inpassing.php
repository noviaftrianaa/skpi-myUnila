<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Inpassing extends Model
{
    protected $table = 'pdrd.inpassing';
    protected $primaryKey = 'id_inpassing';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_inpassing',	'id_sdm',	'id_pangkat_gol',	'sk_inpassing',	'tgl_sk_inpassing',	'tmt_sk_inpassing',	'angka_kredit',	'masa_kerja_thn',	'masa_kerja_bln',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}