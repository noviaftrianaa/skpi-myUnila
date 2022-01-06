<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class GelarAkademik extends AbstractionModel
{
    protected $table = 'ref.gelar_akademik';
    protected $primaryKey = 'id_gelar_akad';
}
