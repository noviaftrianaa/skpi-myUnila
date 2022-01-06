<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisBahanAjar extends AbstractionModel
{
    protected $table = 'ref.jenis_bahan_ajar';
    protected $primaryKey = 'id_jns_bhn_ajar';
}
