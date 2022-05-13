<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use App\Models\PDUT\Ref\LembagaAkred;
use App\Models\PDUT\Temp_iku\Iku8ProdiAkreditasiIntern;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Rap2hpoutre\FastExcel\FastExcel;

class Iku8ProdiAkreditasiInternSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //$this->tempIku();
        //$this->totalDashboard();
        //$this->importRefLembagaAkred();
        $this->importAkreditasiProdi();
    }

    public function tempIku()
    {
        $temp_iku8 = DB::SELECT("
        SELECT 
        sms.id_sms,
        akp.id_akreditasi_prodi,
        la.id_lemb_akred,
        CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
        fak.nm_lemb AS nm_fakultas,
        la.nm_lemb,
        CASE 
            WHEN la.id_lemb_akred = 00001 THEN	'Nasional'
            END AS tkt_lemb_akred,
        DATEDIFF(YEAR, akp.tanggal_sk_akreditasi_prodi, akp.tst_sk_akreditasi_prodi) AS ms_berlaku_akred,
        CASE
            WHEN DATEDIFF(YEAR, akp.tanggal_sk_akreditasi_prodi, GETDATE()) <= 5
           THEN 1
            ELSE 0
        END AS status_iku
    FROM
        pdrd.akreditasi_prodi AS akp WITH(NOLOCK) 
        LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akp.id_sms
        AND sms.soft_delete = 0
        LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
        AND fak.soft_delete = 0
        LEFT JOIN ref.jenis_sms AS js ON js.id_jns_sms = sms.id_jns_sms AND js.expired_date IS NULL
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
        AND jenjang.expired_date IS NULL
        JOIN ref.lembaga_akred AS la ON la.id_lemb_akred = akp.id_lemb_akred
        AND la.expired_date IS NULL
    WHERE
        js.id_jns_sms = '3'
        AND
        akp.soft_delete = 0    

       
        ");

    foreach ($temp_iku8 as $each_data) {
        Iku8ProdiAkreditasiIntern::updateOrInsert([
            'id_sms' => $each_data->id_sms,
            'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
            'lemb_akred' => $each_data->lemb_akred,
        ], [
            'id_prodi_intern' => guid(),
            'nm_prodi' => $each_data->nm_prodi,
            'nm_fakultas' => $each_data->nm_fakultas,
            'nm_lemb' => $each_data->nm_lemb,
            'status_iku' => $each_data->status_iku,
            'last_sync' => currDateTime(),
        ]);

    echo " Data temp_iku8 berhasil diperbaharui\n";
       };
    }

     public function importRefLembagaAkred()
    {
            $lembaga_akred = LembagaAkred::create([
                'id_lemb_akred' => '00002',
                'nm_lemb' => 'ABEST21',
                'jln' => NULL,
                'rt' => NULL,
                'rw' => NULL,
                'nm_dsn' => NULL,
                'ds_kel' => NULL,
                'kode_pos' => NULL,
                'bujur' => NULL,
                'no_tel' => NULL,
                'no_fax' => NULL,
                'email' => NULL,
                'website' => NULL,
                'kd_kl' => NULL,
                'kd_satker' => NULL,
                'tgl_mulai_beroperasi' => '2005-07-01',
                'ket' => NULL,
                'target_akred' => 'P',
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'expired_date' => currDateTime(),
                'last_sync' => currDateTime()
            ]);
            echo " Data berhasil diperbaharui\n";
        ;
    }

    public function importAkreditasiProdi()
    {
        
        $file_path = storage_path('uploads/prodiIntern.xlsx');
        $data_akreditasi_prodi = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {
        $id_creator = '7C999853-1002-4363-B2FD-C8B37F3EB23E';

            $basis_evaluasi = AkreditasiProdi::create([
                'id_akreditasi_prodi' => guid(),
                'id_sms' => $each_data['id_sms'],
                'id_lemb_akred' => $each_data['id_lemb_akred'],
                'id_akred' => $each_data['id_akred'],
                'sk_akreditasi_prodi' => $each_data['sk_akreditasi_prodi'],
                'tanggal_sk_akreditasi_prodi' => $each_data['tanggal_sk_akreditasi_prodi'],
                'tst_sk_akreditasi_prodi' => $each_data['tst_sk_akreditasi_prodi'],
                'asal_data' => $each_data['asal_data'],
                'create_date' => currDateTime(),
                'id_creator' => $id_creator,
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);
            echo " Data berhasil diperbaharui\n";
        });
    }
}