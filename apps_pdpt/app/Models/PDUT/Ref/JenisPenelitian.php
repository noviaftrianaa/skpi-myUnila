<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisPenelitian extends AbstractionModel
{
    protected $table = 'ref.jenis_penelitian';
    protected $primaryKey = 'id_jns_lit';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_lit',	'nm_jns_lit',
    ];
}