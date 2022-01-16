<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class TingkatPrestasi extends AbstractionModel
{
    protected $table = 'ref.tingkat_prestasi';
    protected $primaryKey = 'id_tkt_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tkt_prestasi',	'nm_tkt_prestasi',
    ];
}