<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Jurusan extends Model
{
    protected $table = 'ref.jurusan';
    protected $primaryKey = 'id_jur';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jur',	'nm_jur',	'nm_intl_jur',	'u_sma',	'u_smk',	'u_pt',	'u_slb',	'id_induk_jurusan',	'id_jenj_didik',	'id_kel_bidang',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}