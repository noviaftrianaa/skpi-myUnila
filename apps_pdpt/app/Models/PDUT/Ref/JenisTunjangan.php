<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisTunjangan extends AbstractionModel
{
    protected $table = 'ref.jenis_tunjangan';
    protected $primaryKey = 'id_jns_tunj';
}
