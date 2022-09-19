<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BentukKegiatanKerjasama extends Model
{
    protected $table = 'ref.bentuk_kegiatan_kerjasama';
    protected $primaryKey = 'id_bntk_giat_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bntk_giat_kerjasama',	'nm_bntk_giat_kerjasama',	'ket',	'create_date',	'last_update',
    ];
}