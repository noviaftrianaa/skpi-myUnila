<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KelompokBidang extends AbstractionModel
{
    protected $table = 'ref.kelompok_bidang';
    protected $primaryKey = 'a_leaf_node';
}
