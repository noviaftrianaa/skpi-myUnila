<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class KurikulumSp extends Model
{
    protected $table = 'pdrd.kurikulum_sp';
    protected $primaryKey = 'id_kurikulum_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kurikulum_sp',	'id_jenj_didik',	'id_smt',	'id_sms',	'nm_kurikulum_sp',	'jmlh_smt_normal',	'a_digunakan',	'jmlh_sks_lulus',	'jmlh_sks_wajib',	'jmlh_sks_pilihan',	'jmlh_sks_mk_wajib',	'jmlh_sks_mk_pilih',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}