<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    protected $table = 'ref.wilayah';
    protected $primaryKey = 'id_wil';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_wil',	'id_negara',	'nm_wil',	'asal_wil',	'kode_bps',	'kode_dagri',	'kode_keu',	'id_induk_wilayah',	'id_level_wil',	'create_date',	'last_update',
    ];
}