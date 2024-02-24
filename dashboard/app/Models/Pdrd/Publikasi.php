<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publikasi extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'pdrd.publikasi';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
}
