<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisSdm extends AbstractionModel
{
    protected $table = 'ref.jenis_sdm';
    protected $primaryKey = 'a_dosen';
}
