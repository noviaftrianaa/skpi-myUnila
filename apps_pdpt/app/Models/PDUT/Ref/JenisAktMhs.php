<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisAktMhs extends AbstractionModel
{
    protected $table = 'ref.jenis_akt_mhs';
    protected $primaryKey = 'a_kegiatan_kampus_merdeka';
}
