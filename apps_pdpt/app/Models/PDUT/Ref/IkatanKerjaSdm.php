<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class IkatanKerjaSdm extends AbstractionModel
{
    protected $table = 'ref.ikatan_kerja_sdm';
    protected $primaryKey = 'id_ikatan_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ikatan_kerja',	'nm_ikatan_kerja',	'ket_ikatan_kerja',
    ];
}