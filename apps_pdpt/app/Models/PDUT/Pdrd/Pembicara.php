<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Pembicara extends AbstractionModel
{
    protected $table = 'pdrd.pembicara';
    protected $primaryKey = 'id_pembicara';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pembicara',	'id_kat_capaian',	'id_sdm',	'id_katgiat',	'id_litabmas',	'judul_makalah',	'nm_temu_ilmiah',	'kat_bicara',	'penyelenggara',	'tgl_laks',	'bahasa',	'tkt_temu',	'sk_tugas',	'tgl_sk_tugas',	'id_afiliasi',	'jns_afiliasi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}