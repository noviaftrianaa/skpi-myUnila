<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karya extends Model
{
    protected $table = 'karya';

    protected $fillable = [
        'nim',
        'kategori_karya',
        'judul',
        'tahun',
        'deskripsi',
        'tautan'
    ];

    protected $casts = [
        'tahun' => 'integer'
    ];
}
