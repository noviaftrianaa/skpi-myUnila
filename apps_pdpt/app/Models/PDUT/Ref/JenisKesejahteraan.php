<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisKesejahteraan extends AbstractionModel
{
    protected $table = 'ref.jenis_kesejahteraan';
    protected $primaryKey = 'id_jns_sejahtera';
}
