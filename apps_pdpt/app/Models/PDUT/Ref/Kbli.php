<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Kbli extends Model
{
    protected $table = 'ref.kbli';
    protected $primaryKey = 'id_kbli';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kbli',	'id_induk_kbli',	'kategori',	'kode',	'judul',	'lv_kbli',	'create_date',	'last_update',
    ];
}