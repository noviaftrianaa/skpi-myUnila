<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPrasarana extends AbstractionModel
{
    protected $table = 'ref.jenis_prasarana';
    protected $primaryKey = 'id_jns_prasarana';
}
