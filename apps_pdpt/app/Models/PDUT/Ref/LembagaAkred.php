<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class LembagaAkred extends Model
{
    protected $table = 'ref.lembaga_akred';
    protected $primaryKey = 'id_lemb_akred';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_akred',	'nm_lemb',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'lintang',	'bujur',	'no_tel',	'no_fax',	'email',	'website',	'kd_kl',	'kd_satker',	'tgl_mulai_beroperasi',	'ket',	'target_akred',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}