<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class LembagaPengangkat extends AbstractionModel
{
    protected $table = 'ref.lembaga_pengangkat';
    protected $primaryKey = 'id_lemb_angkat';
}
