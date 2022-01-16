<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class BidangUsaha extends AbstractionModel
{
    protected $table = 'ref.bidang_usaha';
    protected $primaryKey = 'id_bu';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bu',	'nm_bu',
    ];
}