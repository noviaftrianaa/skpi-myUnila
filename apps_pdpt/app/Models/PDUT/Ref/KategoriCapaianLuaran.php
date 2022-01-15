<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class KategoriCapaianLuaran extends AbstractionModel
{
    protected $table = 'ref.kategori_capaian_luaran';
    protected $primaryKey = 'id_kat_capaian';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kat_capaian',	'nm_kat_capaian',
    ];
}