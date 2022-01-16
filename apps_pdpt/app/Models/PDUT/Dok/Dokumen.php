<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class Dokumen extends AbstractionModel
{
    protected $table = 'dok.dokumen';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_jns_dok',	'nm_dok',	'ket_dok',	'file_dok',	'wkt_unggah',	'url',	'media_type',	'file_name',	'id_creator',	'id_updater',	'soft_delete',
    ];
}