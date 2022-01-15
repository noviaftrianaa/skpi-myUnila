<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Negara extends AbstractionModel
{
    protected $table = 'ref.negara';
    protected $primaryKey = 'id_negara';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_negara',	'nm_negara',	'a_ln',	'benua',
    ];
}