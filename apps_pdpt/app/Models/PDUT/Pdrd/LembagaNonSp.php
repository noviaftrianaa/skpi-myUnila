<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class LembagaNonSp extends Model
{
    protected $table = 'pdrd.lembaga_non_sp';
    protected $primaryKey = 'id_lemb_non_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_non_sp',	'nm_lemb',	'singkatan',	'deskripsi',	'level_lemb',	'tgl_mulai_efektif',	'tgl_akhir_efektif',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'lintang',	'bujur',	'no_tel',	'no_fax',	'email',	'website',	'kd_kl',	'kd_satker',	'id_jns_lemb',	'id_wil',	'id_induk_lemb_non_sp',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}