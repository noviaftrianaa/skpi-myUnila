<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KategoriCapaianLuaran extends Model
{
    protected $table = 'ref.kategori_capaian_luaran';
    protected $primaryKey = 'id_kat_capaian';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kat_capaian',	'nm_kat_capaian',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}