<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisSert extends Model
{
    protected $table = 'ref.jenis_sert';
    protected $primaryKey = 'id_jns_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sert',	'nm_jns_sert',	'u_prof_guru',	'u_kepsek',	'u_laboran',	'u_prof_dosen',	'u_lembaga',	'create_date',	'last_update',
    ];
}