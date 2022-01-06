<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisDiklat extends AbstractionModel
{
    protected $table = 'ref.jenis_diklat';
    protected $primaryKey = 'id_jns_diklat';
}
