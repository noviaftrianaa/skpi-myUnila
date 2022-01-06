<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class PangkatGolongan extends AbstractionModel
{
    protected $table = 'ref.pangkat_golongan';
    protected $primaryKey = 'id_pangkat_gol';
}
