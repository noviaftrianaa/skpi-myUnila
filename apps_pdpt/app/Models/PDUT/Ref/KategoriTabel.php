<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KategoriTabel extends Model
{
    protected $table = 'ref.kategori_tabel';
    protected $primaryKey = 'id_kat_tabel';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kat_tabel',	'id_katgiat',	'nm_schema',	'nm_tbl',	'konfig_kolom',	'ket',	'create_date',	'last_update',
    ];
}