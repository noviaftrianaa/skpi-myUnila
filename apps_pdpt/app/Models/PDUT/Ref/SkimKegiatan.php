<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class SkimKegiatan extends AbstractionModel
{
    protected $table = 'ref.skim_kegiatan';
    protected $primaryKey = 'dana_maks_thn_berjalan';
}
