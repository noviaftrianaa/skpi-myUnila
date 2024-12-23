<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SdmAnggotaLitabmas extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'pdrd.sdm_anggota_litabmas';
    protected $primaryKey = ['id_litabmas','id_sdm'];
    public $timestamps = false;
    public $incrementing = false;
    public $hidden = [
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
