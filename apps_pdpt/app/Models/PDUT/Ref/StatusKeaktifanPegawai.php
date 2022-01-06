<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class StatusKeaktifanPegawai extends AbstractionModel
{
    protected $table = 'ref.status_keaktifan_pegawai';
    protected $primaryKey = 'id_stat_aktif';
}
