<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class StatusKepegawaian extends AbstractionModel
{
    protected $table = 'ref.status_kepegawaian';
    protected $primaryKey = 'id_stat_pegawai';
}
