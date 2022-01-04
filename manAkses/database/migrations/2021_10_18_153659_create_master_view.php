<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMasterView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE VIEW master_view AS
                SELECT 
                    kd_brg,kd_lokasi,no_aset,rph_aset,tgl_buku,kuantitas,kondisi,merk_type,tgl_perlh
                FROM t_masteru
                WHERE kuantitas > 0");
    }

    public function down()
    {
        DB::statement("DROP VIEW master_view");
    }
}
