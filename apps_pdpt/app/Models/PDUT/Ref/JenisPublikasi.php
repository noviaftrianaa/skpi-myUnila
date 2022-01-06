<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPublikasi extends AbstractionModel
{
    protected $table = 'ref.jenis_publikasi';
    protected $primaryKey = 'a_pub_prestasi';
}
