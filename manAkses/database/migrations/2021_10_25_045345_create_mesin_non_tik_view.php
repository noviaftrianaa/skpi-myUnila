<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMesinNonTikView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $v1 = DB::table('t_mapbrg')->where(DB::raw('substring(kd_brgbaru,1,2)'), '=', 30)->where(DB::raw('substring(kd_brgbaru,1,3)'), '!=', 301)->where(DB::raw('substring(kd_brgbaru,1,5)'), '!=', 30201)->pluck('kd_brgbaru');
        $v2 = DB::table('t_mapbrg')->where(DB::raw('substring(kd_brgbaru,1,2)'), '=', 31)->where(DB::raw('substring(kd_brgbaru,1,3)'), '!=', 310)->pluck('kd_brgbaru');
        $v3 = DB::table('t_mapbrg')->where('kd_brgbaru', 6020301001)->pluck('kd_brgbaru');
        $final = collect([$v1,$v2,$v3]);
        $final = $final->flatten()->all();
        $v = implode(',', $final);

        $t = DB::table('users')->where(DB::raw('substr(kdlok,1,2)'),'=',04)->select('kdlok as lok')->distinct()->pluck('lok')->all();
        $t = '"' . implode( '","', $t ) . '"';

        DB::STATEMENT('
            CREATE VIEW mesin_non_tik_view AS
            SELECT
                datmutsutbrg.kd_brg, 
                datmutsutbrg.kd_lokasi, 
                datmutsutbrg.no_aset, 
                datmutsutbrg.tgl_buku, 
                datmutsutbrg.tgl_perolehan_pertama, 
                datmutsutbrg.kondisi, 
                datmutsutbrg.merk_type, 
                datmutsutbrg.tgl_perl,
                datmutsutbrg.nm_brg, 
                users.nm_satker, 
                datmutsutbrg.kuantitas,
                datmutsutbrg.npp,
                datmutsutbrg.mutasi,
                datmutsutbrg.penyusutan,
                0 as nilai_perolehan,
                0 as nilai_buku
            FROM (
                SELECT
                    datmutsut.kd_brg, datmutsut.kd_lokasi, datmutsut.no_aset, datmutsut.tgl_buku, datmutsut.tgl_perolehan_pertama, datmutsut.kondisi, datmutsut.merk_type, datmutsut.tgl_perl, datmutsut.npp, datmutsut.mutasi, datmutsut.penyusutan, brg.nm_brg, datmutsut.kuantitas, datmutsut.kd_lokasi_temp, datmutsut.kd_brg_temp
                FROM (
                    SELECT
                        datmut.kd_brg, datmut.kd_lokasi, datmut.no_aset, datmut.tgl_buku, datmut.tgl_perolehan_pertama, datmut.kondisi, datmut.merk_type, datmut.tgl_perl, datmut.npp, datmut.mutasi, susut.penyusutan, datmut.kuantitas, datmut.kd_lokasi_temp, datmut.kd_brg_temp
                    FROM (
                        SELECT
                            data.kd_brg, data.kd_lokasi, data.no_aset, data.tgl_buku, data.tgl_perolehan_pertama, data.kondisi, data.merk_type, data.tgl_perl, data.npp, mutasi.mutasi, data.kuantitas, data.kd_lokasi_temp, data.kd_brg_temp
                        FROM (
                            SELECT
                                kd_brg,kd_lokasi,no_aset,tgl_buku,tgl_buku as tgl_perolehan_pertama,kondisi,kuantitas,merk_type,tgl_perlh as tgl_perl,rph_aset as npp, SUBSTR(kd_lokasi,-5) as kd_lokasi_temp, SUBSTR(kd_brg,1,7) as kd_brg_temp
                            FROM t_masteru
                            WHERE kd_lokasi IN ('.$t.') AND kd_brg IN ('.$v.') AND kuantitas > 0
                            ORDER BY tgl_buku DESC
                        ) as data
                        LEFT JOIN (
                            SELECT
                                kd_brg,kd_lokasi,no_aset, SUM(rph_aset) as mutasi
                            FROM t_masteru
                            WHERE kuantitas = 0
                            GROUP BY kd_brg,kd_lokasi,no_aset
                        ) as mutasi ON data.kd_brg=mutasi.kd_brg AND data.kd_lokasi=mutasi.kd_lokasi AND data.no_aset=mutasi.no_aset ) as datmut
                    LEFT JOIN (
                        SELECT
                            kd_brg,kd_lokasi,no_aset, SUM(rph_susut) as penyusutan, SUBSTR(kd_lokasi,-5) as kd_lokasi_temp
                        FROM t_msusut
                        WHERE kd_lokasi like "02%" AND jnstrn=102
                        GROUP BY kd_brg,kd_lokasi,no_aset,kd_lokasi_temp
                    ) as susut ON datmut.kd_lokasi_temp=susut.kd_lokasi_temp AND datmut.kd_brg=susut.kd_brg AND datmut.no_aset=susut.no_aset ) as datmutsut
                LEFT JOIN (
                    SELECT kd_skelbrg, ur_skel as nm_brg
                    FROM t_skel
                ) as brg ON brg.kd_skelbrg=datmutsut.kd_brg_temp ) as datmutsutbrg
            LEFT JOIN (
                SELECT kdlok, nama as nm_satker
                FROM users
            ) as users ON users.kdlok=datmutsutbrg.kd_lokasi
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW mesin_non_tik_view");
    }
}
