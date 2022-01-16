<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisDokumen extends AbstractionModel
{
    protected $table = 'ref.jenis_dokumen';
    protected $primaryKey = 'id_jns_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_dok',	'nm_jns_dok',
    ];
}