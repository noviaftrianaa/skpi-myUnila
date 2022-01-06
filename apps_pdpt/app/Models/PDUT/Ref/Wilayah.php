<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Wilayah extends AbstractionModel
{
    protected $table = 'ref.wilayah';
    protected $primaryKey = 'asal_wil';
}
