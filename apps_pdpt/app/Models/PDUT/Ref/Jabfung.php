<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Jabfung extends AbstractionModel
{
    protected $table = 'ref.jabfung';
    protected $primaryKey = 'angka_kredit';
}
