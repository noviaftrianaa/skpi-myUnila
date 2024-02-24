<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TulisPub extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'pdrd.tulis_pub';
    protected $primaryKey = 'id_tulis_pub';
    public $timestamps = false;
    public $incrementing = false;
}
