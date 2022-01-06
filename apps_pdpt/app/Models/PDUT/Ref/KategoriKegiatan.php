<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KategoriKegiatan extends AbstractionModel
{
    protected $table = 'ref.kategori_kegiatan';
    protected $primaryKey = 'a_aktif';
}
