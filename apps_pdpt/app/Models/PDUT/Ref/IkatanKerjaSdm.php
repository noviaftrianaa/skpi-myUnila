<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class IkatanKerjaSdm extends AbstractionModel
{
    protected $table = 'ref.ikatan_kerja_sdm';
    protected $primaryKey = 'id_ikatan_kerja';
}
