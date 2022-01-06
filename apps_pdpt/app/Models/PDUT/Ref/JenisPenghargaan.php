<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPenghargaan extends AbstractionModel
{
    protected $table = 'ref.jenis_penghargaan';
    protected $primaryKey = 'id_jns_penghargaan';
}
