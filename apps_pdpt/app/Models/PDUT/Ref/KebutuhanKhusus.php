<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class KebutuhanKhusus extends AbstractionModel
{
    protected $table = 'ref.kebutuhan_khusus';
    protected $primaryKey = 'id_kk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kk',	'nm_kk',
    ];
}