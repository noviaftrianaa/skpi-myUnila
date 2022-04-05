<?php

namespace App\Models\PDUT\Sarpras;

use Illuminate\Database\Eloquent\Model;

class AlatLong extends Model
{
    protected $table = 'sarpras.alat_long';
    protected $primaryKey = 'id_alat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_alat',
        'id_smt',
        'jml_laik',
        'jml_tidak_laik',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];
}
