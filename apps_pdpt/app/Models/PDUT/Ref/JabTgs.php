<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JabTgs extends AbstractionModel
{
    protected $table = 'ref.jab_tgs';
    protected $primaryKey = 'a_jab_utama_lpk';
}
