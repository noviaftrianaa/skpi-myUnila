<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class LevelWilayah extends AbstractionModel
{
    protected $table = 'ref.level_wilayah';
    protected $primaryKey = 'id_level_wil';
}
