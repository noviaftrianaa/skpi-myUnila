<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class BasisEvaluasi extends AbstractionModel
{
    protected $table = 'ref.basis_evaluasi';
    protected $primaryKey = 'id_basis_evaluasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_basis_evaluasi',	'nm_basis_evaluasi',
    ];
}