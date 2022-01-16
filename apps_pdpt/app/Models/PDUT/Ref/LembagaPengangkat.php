<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class LembagaPengangkat extends AbstractionModel
{
    protected $table = 'ref.lembaga_pengangkat';
    protected $primaryKey = 'id_lemb_angkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_angkat',	'nm_lemb_angkat',
    ];
}