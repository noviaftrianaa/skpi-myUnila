<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisSert extends AbstractionModel
{
    protected $table = 'ref.jenis_sert';
    protected $primaryKey = 'id_jns_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sert',	'nm_jns_sert',	'u_prof_guru',	'u_kepsek',	'u_laboran',	'u_prof_dosen',	'u_lembaga',
    ];
}