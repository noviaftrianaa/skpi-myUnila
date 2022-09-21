<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePegawaiTable extends Migration
{
    public function up()
    {
        Schema::create('sikep.pegawai', function (Blueprint $table) {
            $table->integer('id_pegawai');
            $table->string('nm_pegawai');
            $table->char('jk')->nullable();
            $table->char('nip')->nullable();
            $table->char('nidn')->nullable();
            $table->string('tmp_lahir')->nullable();
            $table->date('tgl_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->string('jns_pegawai');
            $table->date('tmt_cpns')->nullable();
            $table->date('tmt_pns')->nullable();
            $table->string('jns_tenaga');
            $table->integer('id_golongan')->nullable();
            $table->date('tmt_gol')->nullable();
            $table->integer('id_fungsional')->nullable();
            $table->date('tmt_fung')->nullable();
            $table->integer('id_struktural')->nullable();
            $table->integer('id_pendidikan')->nullable();
            $table->integer('id_org1')->nullable();
            $table->integer('id_org2')->nullable();
            $table->integer('id_org3')->nullable();
            $table->integer('id_org')->nullable();
            $table->string('status')->nullable();
            $table->date('tmt_pensiun')->nullable();

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
        Schema::dropIfExists('sikep.pegawai');
    }
}
