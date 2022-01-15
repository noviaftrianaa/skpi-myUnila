<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Pekerjaan extends AbstractionModel
{
    protected $table = 'ref.pekerjaan';
    protected $primaryKey = 'id_pekerjaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pekerjaan',	'nm_pekerjaan',
    ];
}