<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisSarana extends AbstractionModel
{
    protected $table = 'ref.jenis_sarana';
    protected $primaryKey = 'a_penempatan';
}
