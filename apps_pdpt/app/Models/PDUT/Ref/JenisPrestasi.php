<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPrestasi extends AbstractionModel
{
    protected $table = 'ref.jenis_prestasi';
    protected $primaryKey = 'id_jenis_prestasi';
}
