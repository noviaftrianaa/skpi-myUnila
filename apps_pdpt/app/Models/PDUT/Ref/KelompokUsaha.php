<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class KelompokUsaha extends AbstractionModel
{
    protected $table = 'ref.kelompok_usaha';
    protected $primaryKey = 'id_kel_usaha';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_usaha',	'nm_kel_usaha',
    ];
}