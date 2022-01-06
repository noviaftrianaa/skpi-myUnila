<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Satuan extends AbstractionModel
{
    protected $table = 'ref.satuan';
    protected $primaryKey = 'kd_satuan';
}
