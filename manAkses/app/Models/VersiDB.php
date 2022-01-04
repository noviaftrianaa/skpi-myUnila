<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VersiDB extends Model
{
    protected $table = 'man_akses.versi_db';
    protected $primaryKey = 'id_versi';
    protected $fillable = ['versi','tgl_update'];
    public $timestamps = false;
    public $incrementing = false;
}
