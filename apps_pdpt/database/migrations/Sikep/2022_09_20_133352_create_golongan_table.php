<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGolonganTable extends Migration
{
    public function up()
    {
        Schema::create('sikep.golongan', function (Blueprint $table) {
            $table->integer('id_gol');
            $table->string('kd_gol');
            $table->string('nm_gol');
            $table->string('nm_pangkat');
            $table->string('deskripsi');

            $table->uuid('id_creator');
            $table->uuid('id_updater')->nullable();
            $table->dateTime('create_date');
            $table->dateTime('last_update')->nullable();
            $table->dateTime('last_sync')->nullable();
            $table->boolean('soft_delete')->default(false);
        });
    }
    public function down()
    {
        Schema::dropIfExists('sikep.golongan');
    }
}
