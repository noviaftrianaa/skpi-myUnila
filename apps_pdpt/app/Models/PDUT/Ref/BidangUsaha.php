<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class BidangUsaha extends AbstractionModel
{
    protected $table = 'ref.bidang_usaha';
    protected $primaryKey = 'id_bu';
}
