<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisDiklat extends AbstractionModel
{
    protected $table = 'ref.jenis_diklat';
    protected $primaryKey = 'id_jns_diklat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_diklat',	'nm_jns_diklat',	'u_guru',	'u_dosen',	'u_tendik',
    ];
}