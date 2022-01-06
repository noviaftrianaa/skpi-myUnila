<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class NilaiAkred extends AbstractionModel
{
    protected $table = 'ref.nilai_akred';
    protected $primaryKey = 'id_akred';
}
