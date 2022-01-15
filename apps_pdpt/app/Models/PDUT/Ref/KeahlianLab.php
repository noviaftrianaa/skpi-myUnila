<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class KeahlianLab extends AbstractionModel
{
    protected $table = 'ref.keahlian_lab';
    protected $primaryKey = 'id_keahlian_lab';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_keahlian_lab',	'nm_keahlian_lab',
    ];
}