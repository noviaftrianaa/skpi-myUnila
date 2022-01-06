<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisHapusBuku extends AbstractionModel
{
    protected $table = 'ref.jenis_hapus_buku';
    protected $primaryKey = 'id_hapus_buku';
}
