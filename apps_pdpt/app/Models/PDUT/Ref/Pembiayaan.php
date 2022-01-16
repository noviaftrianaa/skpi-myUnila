<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Pembiayaan extends AbstractionModel
{
    protected $table = 'ref.pembiayaan';
    protected $primaryKey = 'id_pembiayaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pembiayaan',	'nm_pembiayaan',
    ];
}