<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    protected $keyType = 'string';
    protected $table = 'dok.dokumen';
    protected $fillable = ['id_dok','id_jns_dok','nm_dok','ket_dok','file_dok','wkt_unggah','url','media_type','file_name','created_date','id_creator','last_update','id_updater','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;
}
