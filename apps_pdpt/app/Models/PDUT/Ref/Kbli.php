<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Kbli extends AbstractionModel
{
    protected $table = 'ref.kbli';
    protected $primaryKey = 'id_kbli';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kbli',	'id_induk_kbli',	'kategori',	'kode',	'judul',	'lv_kbli',
    ];
}