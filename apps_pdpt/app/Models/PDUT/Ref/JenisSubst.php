<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisSubst extends Model
{
    protected $table = 'ref.jenis_subst';
    protected $primaryKey = 'id_jns_subst';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_subst',	'nm_jns_subst',	'create_date',	'last_update',
    ];
}