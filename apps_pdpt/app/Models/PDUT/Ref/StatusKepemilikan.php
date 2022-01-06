<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class StatusKepemilikan extends AbstractionModel
{
    protected $table = 'ref.status_kepemilikan';
    protected $primaryKey = 'id_stat_milik';
}
