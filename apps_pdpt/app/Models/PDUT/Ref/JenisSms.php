<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisSms extends AbstractionModel
{
    protected $table = 'ref.jenis_sms';
    protected $primaryKey = 'id_jns_sms';
}
