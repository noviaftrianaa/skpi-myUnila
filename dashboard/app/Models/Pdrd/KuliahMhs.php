<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KuliahMhs extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.kuliah_mhs';
    protected $primaryKey = ['id_reg_pd','id_smt'];

    public $timestamps = false;
    public $incrementing = false;
}
