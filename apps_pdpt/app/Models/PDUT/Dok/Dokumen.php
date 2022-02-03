<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Dokumen extends AbstractionModel
{
    protected $table = 'dok.dokumen';
    protected $primaryKey = 'id_dok';
    protected $keyType = 'string';
    protected $fillable = [
        'id_dok',
        'id_jns_dok',
        'nm_dok',
        'ket_dok',
        'file_dok',
        'wkt_unggah',
        'url',
        'media_type',
        'file_name',
    ];
}
