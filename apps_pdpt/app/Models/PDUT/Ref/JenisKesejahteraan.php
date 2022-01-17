<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisKesejahteraan extends Model
{
    protected $table = 'ref.jenis_kesejahteraan';
    protected $primaryKey = 'id_jns_sejahtera';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sejahtera',	'nm_jns_sejahtera',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}