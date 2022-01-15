<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class NilaiAkred extends AbstractionModel
{
    protected $table = 'ref.nilai_akred';
    protected $primaryKey = 'id_akred';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akred',	'nm_akred',
    ];
}