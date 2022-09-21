<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganisasiTable extends Migration
{
    public function up()
    {
        Schema::create('sikep.unit_orga', function (Blueprint $table) {
            $table->integer('id_unit_orga');
            $table->integer('id_unit_orga_induk')->nullable();
            $table->char('kd_unit_orga')->nullable();
            $table->string('nm_unit_orga');
            $table->text('alamat')->nullable();
            $table->char('no_tlp')->nullable();
            $table->char('no_fax')->nullable();
            $table->char('kd_pos')->nullable();
            $table->string('nm_singkat')->nullable();
            $table->string('nm_inisial')->nullable();

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
        Schema::dropIfExists('sikep.unit_orga');
    }
}
