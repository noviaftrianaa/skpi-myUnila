<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class PengelolaJurnal extends Model
{
    protected $table = 'pdrd.pengelola_jurnal';
    protected $primaryKey = 'id_kelola_jurnal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kelola_jurnal',	'id_media_pub',	'id_sdm',	'id_katgiat',	'peran',	'sk_tugas',	'tmt_sk_tugas',	'tst_sk_tugas',	'a_aktif',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}