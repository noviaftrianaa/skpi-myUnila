<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class FotoPesertaDidik extends Model
{
    protected $table = 'dok.foto_peserta_didik';
    protected $primaryKey = 'id_foto_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_foto_pd',	'id_blob',	'id_pd',	'wkt_unggah',	'a_tampil',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}