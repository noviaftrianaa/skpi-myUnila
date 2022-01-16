<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisTes extends AbstractionModel
{
    protected $table = 'ref.jenis_tes';
    protected $primaryKey = 'id_jns_tes';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tes',	'nm_jns_tes',	'ket',	'nilai_maks',
    ];
}