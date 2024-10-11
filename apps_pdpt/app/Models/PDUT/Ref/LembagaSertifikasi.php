<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LembagaSertifikasi extends AbstractionModel
{
    use HasFactory;
    protected $table = 'ref.lembaga_sertifikasi';
    protected $primaryKey = 'id_lemb_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_lemb_sert',
        'nm_lemb_sert',
        'create_date',
        'last_update',
    ];
}
