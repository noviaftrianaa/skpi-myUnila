<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisTinggal extends AbstractionModel
{
    protected $table = 'ref.jenis_tinggal';
    protected $primaryKey = 'id_jns_tinggal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tinggal',	'nm_jns_tinggal',
    ];
}