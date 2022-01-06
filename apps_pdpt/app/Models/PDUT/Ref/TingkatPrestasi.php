<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TingkatPrestasi extends AbstractionModel
{
    protected $table = 'ref.tingkat_prestasi';
    protected $primaryKey = 'id_tkt_prestasi';
}
