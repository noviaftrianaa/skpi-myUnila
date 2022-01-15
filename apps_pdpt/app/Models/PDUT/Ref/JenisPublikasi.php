<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisPublikasi extends AbstractionModel
{
    protected $table = 'ref.jenis_publikasi';
    protected $primaryKey = 'id_jns_pub';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_pub',	'nm_jns_pub',	'a_pub_prestasi',
    ];
}