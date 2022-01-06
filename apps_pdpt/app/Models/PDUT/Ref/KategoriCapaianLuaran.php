<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KategoriCapaianLuaran extends AbstractionModel
{
    protected $table = 'ref.kategori_capaian_luaran';
    protected $primaryKey = 'id_kat_capaian';
}
