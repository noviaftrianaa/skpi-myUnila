<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BasisEvaluasi extends Model
{
    protected $table = 'ref.basis_evaluasi';
    protected $primaryKey = 'id_basis_evaluasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_basis_evaluasi',	'nm_basis_evaluasi',	'create_date',	'last_update',
    ];
}