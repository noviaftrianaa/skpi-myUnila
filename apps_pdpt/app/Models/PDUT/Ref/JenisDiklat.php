<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisDiklat extends Model
{
    protected $table = 'ref.jenis_diklat';
    protected $primaryKey = 'id_jns_diklat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_diklat',	'nm_jns_diklat',	'u_guru',	'u_dosen',	'u_tendik',	'create_date',	'last_update',
    ];
}