<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisEvaluasi extends AbstractionModel
{
    protected $table = 'ref.jenis_evaluasi';
    protected $primaryKey = 'id_jns_eval';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_eval',	'nm_jns_eval',	'ket_jns_eval',
    ];
}