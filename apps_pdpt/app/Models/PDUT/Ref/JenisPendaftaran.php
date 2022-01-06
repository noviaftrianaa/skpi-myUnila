<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPendaftaran extends AbstractionModel
{
    protected $table = 'ref.jenis_pendaftaran';
    protected $primaryKey = 'id_jns_daftar';
}
