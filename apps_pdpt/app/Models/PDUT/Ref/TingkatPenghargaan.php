<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class TingkatPenghargaan extends AbstractionModel
{
    protected $table = 'ref.tingkat_penghargaan';
    protected $primaryKey = 'id_tkt_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tkt_penghargaan',	'nm_tkt_penghargaan',
    ];
}