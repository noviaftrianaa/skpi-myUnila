<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenjangPendidikan extends AbstractionModel
{
    protected $table = 'ref.jenjang_pendidikan';
    protected $primaryKey = 'id_jenj_didik';
}
