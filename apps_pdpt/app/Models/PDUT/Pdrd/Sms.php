<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Sms extends AbstractionModel
{
    protected $table = 'pdrd.sms';
    protected $primaryKey = 'id_sms';

    public function jenjang()
    {
        return $this->belongsTo('App\Models\PDUT\Ref\JenjangPendidikan','id_jenj_didik','id_jenj_didik');
    }
}
