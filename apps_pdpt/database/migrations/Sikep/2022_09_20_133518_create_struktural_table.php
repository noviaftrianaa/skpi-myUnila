<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStrukturalTable extends Migration
{
    public function up()
    {
        Schema::create('sikep.jabstruk', function (Blueprint $table) {
            $table->integer('id_jabstruk');
            $table->char('kd_jabstruk');
            $table->string('nm_jabstruk');

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
        Schema::dropIfExists('sikep.jabstruk');
    }
}
