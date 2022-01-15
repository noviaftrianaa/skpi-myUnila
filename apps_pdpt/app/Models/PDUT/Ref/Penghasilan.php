<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Penghasilan extends AbstractionModel
{
    protected $table = 'ref.penghasilan';
    protected $primaryKey = 'id_penghasilan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghasilan',	'nm_penghasilan',
    ];
}