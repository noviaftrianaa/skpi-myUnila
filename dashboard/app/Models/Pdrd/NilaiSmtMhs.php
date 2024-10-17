<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NilaiSmtMhs extends AbstractionModel
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.nilai_smt_mhs';
    protected $primaryKey = ['id_reg_pd','id_kls'];

    public $timestamps = false;
    public $incrementing = false;
}
