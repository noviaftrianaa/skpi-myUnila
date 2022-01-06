<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisPenelitian extends AbstractionModel
{
    protected $table = 'ref.jenis_penelitian';
    protected $primaryKey = 'id_jns_lit';
}
