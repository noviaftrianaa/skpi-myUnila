<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Penghasilan extends AbstractionModel
{
    protected $table = 'ref.penghasilan';
    protected $primaryKey = 'id_penghasilan';
}
