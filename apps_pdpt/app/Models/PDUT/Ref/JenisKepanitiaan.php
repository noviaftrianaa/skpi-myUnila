<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisKepanitiaan extends AbstractionModel
{
    protected $table = 'ref.jenis_kepanitiaan';
    protected $primaryKey = 'id_jns_panitia';
}
