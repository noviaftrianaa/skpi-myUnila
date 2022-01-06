<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TahunAnggaran extends AbstractionModel
{
    protected $table = 'ref.tahun_anggaran';
    protected $primaryKey = 'a_periode_aktif';
}
