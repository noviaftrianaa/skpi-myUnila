<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KelompokProfesi extends AbstractionModel
{
    protected $table = 'ref.kelompok_profesi';
    protected $primaryKey = 'id_kel_prof';
}
