<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class MediaPublikasi extends AbstractionModel
{
    protected $table = 'ref.media_publikasi';
    protected $primaryKey = 'id_media_pub';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_media_pub',	'id_jns_media',	'id_kel_bidang',	'id_sp',	'id_negara',	'nm_media_pub',	'bentuk_media_pub',	'grade_sinta',	'jns_penerbit',
    ];
}