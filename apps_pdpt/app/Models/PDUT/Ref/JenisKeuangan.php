<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisKeuangan extends AbstractionModel
{
    protected $table = 'ref.jenis_keuangan';
    protected $primaryKey = 'a_pemasukan';
}
