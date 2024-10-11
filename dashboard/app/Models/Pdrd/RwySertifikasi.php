<?php

namespace App\Models\Pdrd;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RwySertifikasi extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    protected $table = 'pdrd.rwy_sertifikasi';
    protected $primaryKey = 'id_rwy_sert';
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

    public static function get_rwy_sert($tipe='serdos',$level,$sms,$thn=null)
    {
        $filter = '';
        if ($level=='fakultas') {
            if ($id_jns_lemb == 23) {
                $filter = " AND tfak.id_sms='" . $id_organisasi . "'";
            } elseif ($id_jns_lemb == 28) {
                $filter = " AND tprod.id_jur_unila='" . $id_organisasi . "'";
            } elseif ($id_jns_lemb == 24) {
                $filter = " AND tprod.id_sms='" . $id_organisasi . "'";
            }
        }

    }
}
