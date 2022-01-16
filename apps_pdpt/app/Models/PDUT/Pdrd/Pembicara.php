<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Pembicara extends Model
{
    protected $table = 'pdrd.pembicara';
    protected $primaryKey = 'id_pembicara';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pembicara',	'id_kat_capaian',	'id_sdm',	'id_katgiat',	'id_litabmas',	'judul_makalah',	'nm_temu_ilmiah',	'kat_bicara',	'penyelenggara',	'tgl_laks',	'bahasa',	'tkt_temu',	'sk_tugas',	'tgl_sk_tugas',	'id_afiliasi',	'jns_afiliasi',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}