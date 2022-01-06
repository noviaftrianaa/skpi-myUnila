<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JalurDaftar extends AbstractionModel
{
    protected $table = 'ref.jalur_daftar';
    protected $primaryKey = 'id_jalur_daftar';
}
