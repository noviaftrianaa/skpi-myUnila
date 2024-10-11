<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegPd extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.reg_pd';
    protected $primaryKey = 'id_reg_pd';

    public $timestamps = false;
    public $incrementing = false;
}
