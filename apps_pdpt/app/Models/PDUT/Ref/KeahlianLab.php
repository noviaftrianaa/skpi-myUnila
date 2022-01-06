<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KeahlianLab extends AbstractionModel
{
    protected $table = 'ref.keahlian_lab';
    protected $primaryKey = 'id_keahlian_lab';
}
