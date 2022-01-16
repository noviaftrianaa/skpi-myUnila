<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class TugasTambahan extends Model
{
    protected $table = 'pdrd.tugas_tambahan';
    protected $primaryKey = 'id_tgs_tambah';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tgs_tambah',	'id_jab_tgs',	'id_sdm',	'id_katgiat',	'id_sms',	'id_sp',	'jml_jam',	'sk_tugas_tambah',	'tmt_sk_tambah',	'tst_sk_tambah',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}