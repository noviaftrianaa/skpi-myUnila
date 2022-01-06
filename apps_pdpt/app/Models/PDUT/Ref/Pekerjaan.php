<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Pekerjaan extends AbstractionModel
{
    protected $table = 'ref.pekerjaan';
    protected $primaryKey = 'id_pekerjaan';
}
