<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Kepanitiaan extends Model
{
    protected $table = 'pdrd.kepanitiaan';
    protected $primaryKey = 'id_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_panitia',	'id_jns_panitia',	'nm_panitia',	'instansi',	'tkt_panitia',	'sk_tugas',	'tmt_sk_tugas',	'tst_sk_tugas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}