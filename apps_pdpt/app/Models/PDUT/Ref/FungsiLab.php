<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class FungsiLab extends AbstractionModel
{
    protected $table = 'ref.fungsi_lab';
    protected $primaryKey = 'id_fungsi_lab';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_fungsi_lab',	'nm_fungsi_lab',
    ];
}