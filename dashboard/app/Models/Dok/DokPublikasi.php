<?php

namespace App\Models\Dok;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DokPublikasi extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'dok.dok_publikasi';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
}
