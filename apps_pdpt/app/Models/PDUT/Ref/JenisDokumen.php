<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisDokumen extends AbstractionModel
{
    protected $table = 'ref.jenis_dokumen';
    protected $primaryKey = 'id_jns_dok';
}
