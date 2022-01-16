<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AktMhs extends Model
{
    protected $table = 'pdrd.akt_mhs';
    protected $primaryKey = 'id_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akt_mhs',	'id_jns_akt_mhs',	'id_sms',	'id_smt',	'judul_akt_mhs',	'lokasi_kegiatan',	'sk_tugas',	'tgl_sk_tugas',	'ket_akt',	'a_komunal',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}