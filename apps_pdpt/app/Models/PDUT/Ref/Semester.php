<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Semester extends AbstractionModel
{
    protected $table = 'ref.semester';
    protected $primaryKey = 'a_periode_aktif';
}
