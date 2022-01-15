<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisPenghargaan extends AbstractionModel
{
    protected $table = 'ref.jenis_penghargaan';
    protected $primaryKey = 'id_jns_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_penghargaan',	'nm_jns_penghargaan',	'u_sdm',	'u_lembaga',
    ];
}