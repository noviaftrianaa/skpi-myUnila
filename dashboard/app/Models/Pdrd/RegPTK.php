<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegPTK extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.reg_ptk';
    protected $primaryKey = 'id_reg_ptk';

    public $timestamps = false;
    public $incrementing = false;

    public function sms()
    {
        return $this->belongsTo('\App\Models\Pdrd\SMS','id_sms','id_sms');
    }
}
