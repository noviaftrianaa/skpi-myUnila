<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisBahanAjar extends AbstractionModel
{
    protected $table = 'ref.jenis_bahan_ajar';
    protected $primaryKey = 'id_jns_bhn_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_bhn_ajar',	'nm_jns_bhn_ajar',
    ];
}