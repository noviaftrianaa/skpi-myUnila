<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class FotoPesertaDidik extends AbstractionModel
{
    protected $table = 'dok.foto_peserta_didik';
    protected $primaryKey = 'id_foto_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_foto_pd',	'id_blob',	'id_pd',	'wkt_unggah',	'a_tampil',	'id_creator',	'id_updater',	'soft_delete',
    ];
}