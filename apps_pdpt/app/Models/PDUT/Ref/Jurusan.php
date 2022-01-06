<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Jurusan extends AbstractionModel
{
    protected $table = 'ref.jurusan';
    protected $primaryKey = 'id_induk_jurusan';
}
