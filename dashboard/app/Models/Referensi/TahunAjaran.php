<?php

namespace App\Models\Referensi;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'ref.tahun_ajaran';
    protected $primaryKey = 'id_thn_ajaran';

    public $timestamps = false;
    public $incrementing = false;
}
