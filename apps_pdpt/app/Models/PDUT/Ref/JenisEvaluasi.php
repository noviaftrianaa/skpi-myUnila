<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisEvaluasi extends AbstractionModel
{
    protected $table = 'ref.jenis_evaluasi';
    protected $primaryKey = 'id_jns_eval';
}
