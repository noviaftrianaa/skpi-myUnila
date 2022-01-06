<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisBeasiswa extends AbstractionModel
{
    protected $table = 'ref.jenis_beasiswa';
    protected $primaryKey = 'id_jns_beasiswa';
}
