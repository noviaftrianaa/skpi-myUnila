<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KebutuhanKhusus extends AbstractionModel
{
    protected $table = 'ref.kebutuhan_khusus';
    protected $primaryKey = 'id_kk';
}
