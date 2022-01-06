<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class FungsiLab extends AbstractionModel
{
    protected $table = 'ref.fungsi_lab';
    protected $primaryKey = 'id_fungsi_lab';
}
