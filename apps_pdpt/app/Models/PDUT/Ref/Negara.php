<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Negara extends AbstractionModel
{
    protected $table = 'ref.negara';
    protected $primaryKey = 'a_ln';
}
