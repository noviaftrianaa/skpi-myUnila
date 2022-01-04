<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDokumenTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dokumen', function (Blueprint $table) {
            $table->increments('id_dok');
            $table->string('kd_lokasi',20);
            $table->string('kd_brg',10);
            $table->decimal('no_aset',10,0);
            $table->text('url');
            $table->text('keterangan')->nullable();
            $table->date('tgl_upload');
            $table->timestamps();

            $table->index(['kd_lokasi','kd_brg','no_aset']);
            $table->charset = 'latin1';
            $table->collation = 'latin1_general_ci';
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dokumen');
    }
}
