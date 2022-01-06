<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisLembaga extends AbstractionModel
{
    protected $table = 'ref.jenis_lembaga';
    protected $primaryKey = 'a_lemb_akred';
}
