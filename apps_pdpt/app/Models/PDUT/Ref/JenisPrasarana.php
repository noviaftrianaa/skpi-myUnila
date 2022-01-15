<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisPrasarana extends AbstractionModel
{
    protected $table = 'ref.jenis_prasarana';
    protected $primaryKey = 'id_jns_prasarana';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_prasarana',	'nm_jns_prasarana',
    ];
}