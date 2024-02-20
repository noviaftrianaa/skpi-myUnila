<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeaktifanPTK extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.keaktifan_ptk';
    protected $primaryKey = 'id_reg_ptk';

    public $timestamps = false;
    public $incrementing = false;
}
