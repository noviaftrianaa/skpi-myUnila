<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    protected $table = 'dok.dokumen';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_jns_dok',	'nm_dok',	'ket_dok',	'file_dok',	'wkt_unggah',	'url',	'media_type',	'file_name',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}