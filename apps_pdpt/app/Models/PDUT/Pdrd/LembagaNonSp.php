<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class LembagaNonSp extends AbstractionModel
{
    protected $table = 'pdrd.lembaga_non_sp';
    protected $primaryKey = 'bujur';
    protected $fillable = [
    	'bujur',		'deskripsi',		'ds_kel',		'email',		'id_creator',		'id_induk_lemb_non_sp',		'id_jns_lemb',		'id_lemb_non_sp',		'id_updater',		'id_wil',		'jln',		'kd_kl',		'kd_satker',		'kode_pos',		'level_lemb',		'lintang',		'nm_dsn',		'nm_lemb',		'no_fax',		'no_tel',		'rt',		'rw',		'singkatan',		'soft_delete',		'tgl_akhir_efektif',		'tgl_mulai_efektif',		'website',
    ];
}
