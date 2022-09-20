<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFunsionalTable extends Migration
{
    public function up()
    {
        Schema::create('sikep.jabfung', function (Blueprint $table) {
            $table->integer('id_jabfung');
            $table->string('nm_jabfung');
            $table->string('kum')->nullable();
            $table->string('ispak')->nullable();
            $table->integer('id_gol')->nullable();
            $table->char('tipe')->nullable();
            $table->integer('grade')->nullable();

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
        Schema::dropIfExists('sikep.jabfung');
    }
}
