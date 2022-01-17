<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;


class NonCaAnggotaLitabmas extends Model
{
    protected $table = 'pdrd.non_ca_anggota_litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_litabmas',
	'id_orang',
	'peran_litabmas',
	'stat_aktif',
	'id_creator',
	'id_updater',
	'soft_delete',

    ];
}