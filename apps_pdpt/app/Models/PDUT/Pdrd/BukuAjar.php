<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class BukuAjar extends AbstractionModel
{
    protected $table = 'pdrd.buku_ajar';
    protected $primaryKey = 'id_buku_ajar';
    protected $fillable = [
    	'id_buku_ajar',		'id_creator',		'id_jns_bhn_ajar',		'id_kat_capaian',		'id_litabmas',		'id_updater',		'isbn',		'judul_buku',		'penerbit',		'penulis',		'sk_tugas',		'soft_delete',		'tgl_sk_tugas',		'tgl_terbit',
    ];
}
