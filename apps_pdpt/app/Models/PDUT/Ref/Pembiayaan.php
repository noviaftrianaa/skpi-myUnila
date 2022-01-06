<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Pembiayaan extends AbstractionModel
{
    protected $table = 'ref.pembiayaan';
    protected $primaryKey = 'id_pembiayaan';
}
