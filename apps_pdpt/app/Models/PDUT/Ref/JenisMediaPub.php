<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisMediaPub extends AbstractionModel
{
    protected $table = 'ref.jenis_media_pub';
    protected $primaryKey = 'id_jns_media';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_media',	'nm_jns_media',
    ];
}