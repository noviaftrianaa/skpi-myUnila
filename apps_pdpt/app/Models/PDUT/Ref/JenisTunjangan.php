<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisTunjangan extends AbstractionModel
{
    protected $table = 'ref.jenis_tunjangan';
    protected $primaryKey = 'id_jns_tunj';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tunj',	'nm_jns_tunj',
    ];
}