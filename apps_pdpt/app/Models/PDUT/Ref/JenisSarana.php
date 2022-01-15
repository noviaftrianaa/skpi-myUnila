<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisSarana extends AbstractionModel
{
    protected $table = 'ref.jenis_sarana';
    protected $primaryKey = 'id_jns_sarana';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sarana',	'nm_jns_sarana',	'kel',	'a_penempatan',	'ket',
    ];
}