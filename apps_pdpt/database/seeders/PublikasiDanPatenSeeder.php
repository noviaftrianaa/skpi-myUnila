<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AktAjarDosen;
use App\Models\PDUT\Pdrd\KeaktifanPtk;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\RegPtk;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Pdrd\TulisPub;
use Illuminate\Database\Seeder;

class PublikasiDanPatenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sdm_collect_id = Sdm::where('soft_delete',0)->pluck('id_sdm')->toArray();
        $get_id_publikasi = \DB::connection('pgsql_sister')->SELECT("
            SELECT
                a.id_publikasi,
                p.id_jns_pub,
                p.judul,
                p.judul_chapter,
                p.judul_asli,
                p.abstrak,
                p.nama_jurnal,
                p.laman_jurnal,
                p.tgl_terbit,
                p.edisi,
                p.impact_jurnal,
                p.vol,
                p.no,
                p.hal,
                p.jml_hal,
                p.penerbit,
                p.kota,
                p.a_seminar,
                p.a_prosiding,
                p.dimensi,
                p.bahasa,
                p.no_paten,
                p.pemberi_paten,
                p.doi,
                p.isbn,
                p.issn,
                p.e_issn,
                p.url,
                p.ket,
                p.pengguna_produk_jasa,
                p.a_komersialisasi,
                p.stat_impor_sinta,
                p.quartile,
                p.id_kat_capaian,
                p.id_media_pub,
                p.id_litabmas,
                p.tgl_create AS create_date,
                p.id_updater AS id_creator,
                p.last_update,
                p.id_updater,
                p.soft_delete,
                p.last_sync
            FROM (
                SELECT DISTINCT
                p.id_publikasi
                FROM pdrd.sdm AS tsdm
                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.a_sp_homebase=1 AND ta.id_thn_ajaran >=2014
                JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp=tr.id_sp AND tsp.npsn='001026'
                JOIN pdrd.tulis_pub AS tp ON tp.id_sdm=tp.id_sdm AND tp.soft_delete=0
                JOIN pdrd.publikasi AS p ON p.id_publikasi=tp.id_publikasi
            -- 	JOIN sdid.dok_litabmas AS dok ON dok.id_litabmas=l.id_litabmas AND dok.soft_delete=0
                WHERE tsdm.soft_delete=0
            ) AS a
            JOIN pdrd.publikasi AS p ON p.id_publikasi=a.id_publikasi
        ");
        $total_pub = count($get_id_publikasi);
        foreach ($get_id_publikasi AS $urutan_pub=>$each_data_publikasi) {
            echo "Publikasi ".($urutan_pub+1)." dari ".$total_pub." id:".$each_data_publikasi->id_publikasi;
            $cari_pub_od = Publikasi::find($each_data_publikasi->id_publikasi);
            if (is_null($cari_pub_od)) {
                $input_pub = (array) $each_data_publikasi;
                $input_pub['tgl_terbit']    = date('Y-m-d',strtotime($each_data_publikasi['tgl_terbit']));
                if (!in_array($input_pub['soft_delete'],[0,1])) {
                    $input_pub['stat_impor_sinta']  = $input_pub['soft_delete'];
                    $input_pub['soft_delete']       = (in_array($input_pub['soft_delete'],[4,5])?1:0);
                }
                $publikasi = new Publikasi();
                $publikasi->fill($input_pub)->save();
            }

            $cari_penulis_sister = \DB::connection('pgsql_sister')->table('pdrd.tulis_pub')
                ->select([
                    'id_tulis_pub',
                    'id_publikasi',
                    'id_sdm',
                    'id_katgiat',
                    'id_pd',
                    'id_orang',
                    'urutan',
                    'afiliasi',
                    'peran_tulis',
                    'jns_penulis',
                    'a_corr_author',
                    'nm_pd',
                    'nipd',
                    'id_afiliasi',
                    'jns_afiliasi',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_publikasi',$each_data_publikasi->id_publikasi)
                ->where('soft_delete',0)
                ->get();
            foreach ($cari_penulis_sister AS $each_penulis_sister) {
                if (is_null($each_penulis_sister->id_sdm) || in_array($each_penulis_sister->id_sdm,$sdm_collect_id)) {
                    $cari_tulis_od = TulisPub::find($each_penulis_sister->id_tulis_pub);
                    if (is_null($cari_tulis_od)) {
                        $input_tulis = (array) $each_penulis_sister;
                        $tulis_pub = new TulisPub();
                        $tulis_pub->fill($input_tulis)->save();
                    }
                }
            }

            $cari_dokumen = \DB::connection('pgsql_sister')->table('sdid.dok_pub')
                ->select([
                    'id_publikasi',
                    'id_dok',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])->where('id_publikasi',$each_data_publikasi->id_publikasi)
                ->get();
            foreach ($cari_dokumen AS $each_dokumen) {
                \DB::connection('pgsql_sister')->table('sdid.dok_pub')->insert((array) $each_dokumen);
            }
            echo " (OK)\n";
        }
    }
}
