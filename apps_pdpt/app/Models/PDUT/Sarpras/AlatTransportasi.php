<?php

namespace App\Models\PDUT\Sarpras;

use Illuminate\Database\Eloquent\Model;

class AlatTransportasi extends Model
{
    protected $table = 'sarpras.alat_transportasi';
    protected $primaryKey = 'id_alat_transport';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_alat_transport',
        'nm_alat_transport',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];
}
