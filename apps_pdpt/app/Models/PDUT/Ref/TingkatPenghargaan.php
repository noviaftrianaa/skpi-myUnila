<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TingkatPenghargaan extends AbstractionModel
{
    protected $table = 'ref.tingkat_penghargaan';
    protected $primaryKey = 'id_tkt_penghargaan';
}
