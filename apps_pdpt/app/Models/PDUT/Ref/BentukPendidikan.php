<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class BentukPendidikan extends AbstractionModel
{
    protected $table = 'ref.bentuk_pendidikan';
    protected $primaryKey = 'a_aktif';
}
