<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisPublikasi extends Model
{
    protected $table = 'ref.jenis_publikasi';
    protected $primaryKey = 'id_jns_pub';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_pub',	'nm_jns_pub',	'a_pub_prestasi',	'create_date',	'last_update',
    ];
}