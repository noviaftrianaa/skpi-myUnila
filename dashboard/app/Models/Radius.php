<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radius extends Model
{
    protected $connection = 'mysql';
    protected $table = 'radcheck';
    protected $primaryKey = 'id';
    public $timestamps = false;
}
