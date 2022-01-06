<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisKeluar extends AbstractionModel
{
    protected $table = 'ref.jenis_keluar';
    protected $primaryKey = 'a_pd';
}
