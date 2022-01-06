<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class StatusAnak extends AbstractionModel
{
    protected $table = 'ref.status_anak';
    protected $primaryKey = 'id_stat_anak';
}
