<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Organisasi extends Model
{
    protected $table = 'sikep.unit_orga';
    protected $primaryKey = 'id_unit_orga';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_unit_orga',
        'id_unit_orga_induk',
        'kd_unit_orga',
        'nm_unit_orga',
        'alamat',
        'no_tlp',
        'no_fax',
        'kd_pos',
        'nm_singkat',
        'nm_inisial',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
