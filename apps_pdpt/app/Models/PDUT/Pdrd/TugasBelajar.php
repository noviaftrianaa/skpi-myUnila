<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class TugasBelajar extends Model
{
    protected $table = 'pdrd.tugas_belajar';
    protected $primaryKey = 'id_tb';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tb',	'id_sp',	'id_jenj_didik',	'id_sdm',	'nm_prodi',	'tgl_mulai_tb',	'domisili',	'sk_tb',	'tgl_sk_tb',	'pembiayaan',	'tgl_lulus',	'id_negara',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}