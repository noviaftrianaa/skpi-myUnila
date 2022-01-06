<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends AbstractionModel
{
    protected $table = 'ref.tahun_ajaran';
    protected $primaryKey = 'a_periode_aktif';
}
