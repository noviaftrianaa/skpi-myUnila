<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KelompokUsaha extends AbstractionModel
{
    protected $table = 'ref.kelompok_usaha';
    protected $primaryKey = 'id_kel_usaha';
}
