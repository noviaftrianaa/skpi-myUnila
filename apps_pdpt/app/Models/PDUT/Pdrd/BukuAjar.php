<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class BukuAjar extends AbstractionModel
{
    protected $table = 'pdrd.buku_ajar';
    protected $primaryKey = 'id_buku_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_buku_ajar',	'id_kat_capaian',	'id_jns_bhn_ajar',	'id_litabmas',	'judul_buku',	'penulis',	'penerbit',	'isbn',	'tgl_terbit',	'sk_tugas',	'tgl_sk_tugas',	'id_creator',	'id_updater',	'soft_delete',
    ];
}