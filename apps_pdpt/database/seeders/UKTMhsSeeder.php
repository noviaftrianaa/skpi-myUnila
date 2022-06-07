<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\PesertaDidik;
use Illuminate\Database\Seeder;

class UKTMhsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ini_set('memory_limit',-1);
        ini_set('max_execution_time',0);
        $tarik = [
//            'daftar_ukt',
            'ukt_mhs'
        ];
        $akses_wsdl = getAksesSiloket();
        if ($akses_wsdl==true) {
            if ($akses_wsdl['status'] == 'success') {
                $token = $akses_wsdl['data'];
                if (in_array('daftar_ukt',$tarik)) {
                    try {
                        $client = getWsdlSiloket();
                        $proxy = $client->getProxy();
                        $err = $client->getError();
                        if ($err) {
                            return false;
                        }else{
                            for ($tahun=2011;$tahun<=(int) date('Y');$tahun++) {
                                for ($iterasi_dftr_ukt=0;$iterasi_dftr_ukt<=1000;$iterasi_dftr_ukt++) {
                                    echo "Tarik UKT tahun ".$tahun." iterasi ke-".($iterasi_dftr_ukt+1);
                                    $cari_iterasi = \DB::table('keuangan.temp_iterasi_ukt')->where('tahun',$tahun)->where('urutan_iterasi',$iterasi_dftr_ukt)->first();
                                    if (is_null($cari_iterasi)) {
                                        \DB::table('keuangan.temp_iterasi_ukt')->insert([
                                            'id_temp_iterasi'   => guid(),
                                            'urutan_iterasi'    => $iterasi_dftr_ukt,
                                            'tahun'             => $tahun
                                        ]);
                                    } else {
                                        if ($cari_iterasi->a_selesai==1) {
                                            echo " (LEWATI)\n";
                                            continue;
                                        }
                                    }
                                    $response = $proxy->DaftarUKT($token,"tahun=".$tahun,"kode_fak ASC, nama_program_studi ASC, kode_kelas ASC",'100',$iterasi_dftr_ukt);
//                                $response = $proxy->DaftarUKT($token,"tahun=2013","kode_fak ASC, nama_program_studi ASC, kode_kelas ASC",'100',149);
//                                dd($response);
                                    if (count($response['result'])>0) {
                                        foreach ($response['result'] AS $each_data_ukt) {
                                            $cari = \DB::table('keuangan.temp_daftar_ukt')->where('id_ukt',$each_data_ukt['id_ukt'])->first();
                                            if (is_null($cari)) {
                                                \DB::table('keuangan.temp_daftar_ukt')->insert([
                                                    'id_ukt'	    => $each_data_ukt['id_ukt'],
                                                    'tahun'	        => $each_data_ukt['tahun'],
                                                    'id_prodi'	    => $each_data_ukt['id_prodi'],
                                                    'nama_prodi'	=> $each_data_ukt['nama_program_studi'],
                                                    'kode_fak'	    => $each_data_ukt['kode_fak'],
                                                    'fk_fak'	    => $each_data_ukt['fk_fakultas'],
                                                    'kode_kelas'	=> $each_data_ukt['kode_kelas'],
                                                    'fk_kelas_ukt'	=> $each_data_ukt['fk_kelas_ukt'],
                                                    'nominal'	    => $each_data_ukt['nominal'],
                                                    'flag_non_aktif'=> $each_data_ukt['flag_non_aktif'],
                                                    'kode_dikti'	=> $each_data_ukt['kode_dikti'],
                                                    'kode_strata'	=> $each_data_ukt['kode_strata'],
                                                    'fk_nama_stara'	=> $each_data_ukt['fk_nama_strata']
                                                ]);
                                            }
                                            \DB::table('keuangan.temp_iterasi_ukt')->where('tahun',$tahun)->where('urutan_iterasi',$iterasi_dftr_ukt)->update([
                                                'a_selesai' => 1
                                            ]);
                                        }
                                        echo " (OK)\n";
                                    } else {
                                        \DB::table('keuangan.temp_iterasi_ukt')->where('tahun',$tahun)->where('urutan_iterasi',$iterasi_dftr_ukt)->update([
                                            'a_selesai' => 1
                                        ]);
                                        echo " (Lewati)\n";
                                        break;
                                    }
                                }
                            }
                        }
                    } catch (Exception $e) {
                        $response = '';
                    } catch (SoapFault $e) {
                        $response = '';
                    }
                    if($response['error_code'] == '0'){
                        return [
                            'status'    => 'success',
                            'data'      => $response['result'][0]
                        ];
                    } else {
                        return [
                            'status'    => 'error',
                            'error_code'=> $response['error_code'],
                            'data'      => [],
                            'error_desc'=> $response['error_desc']
                        ];
                    }
                } elseif (in_array('ukt_mhs',$tarik)) {
                    try {
                        $client = getWsdlSiloket();
                        $proxy = $client->getProxy();
                        $err = $client->getError();
                        if ($err) {
                            return false;
                        }else{
                            for ($tahun=2014;$tahun<=(int) date('Y');$tahun++) {
                                $mhs = PesertaDidik::daftar_mhs_per_angkatan($tahun);
                                $total = count($mhs);
                                if ($total>0) {
                                    foreach ($mhs AS $no_mhs=>$each_mhs) {
                                        echo "Tarik UKT tahun ".$tahun." NPM:".$each_mhs->nipd." data ke-".($no_mhs+1)." dari ".$total;
                                        $response = $proxy->MasterBiayaMahasiswa($token,"npm='".$each_mhs->nipd."'","nama ASC",'100',0);
//                                        $response = $proxy->MasterBiayaMahasiswa($token,"npm='1411011005'","nama ASC",'100',0);
//                                        dd($response);
                                        if (count($response['result'])>0) {
                                            foreach ($response['result'] AS $each_result) {
                                                if (count($each_result['riwayat'])>0) {
                                                    foreach ($each_result['riwayat'] AS $each_ukt) {
                                                        $smt = (explode('/',$each_ukt['tahun_akd'])[0]).$each_ukt['ganjil_genap'];
                                                        $cari = \DB::table('keuangan.temp_ukt_mhs')->where('id_reg_pd',$each_mhs->id_reg_pd)->where('id_smt',$smt)->first();
                                                        if (is_null($cari)) {
                                                            \DB::table('keuangan.temp_ukt_mhs')->insert([
                                                                'id_reg_pd'	        => $each_mhs->id_reg_pd,
                                                                'id_smt'	        => $smt,
                                                                'id_semester'	    => $each_ukt['id_semester'],
                                                                'fk_nama_semester'	=> $each_ukt['fk_nama_semester'],
                                                                'id_ukt'	        => $each_ukt['id_ukt']==''?null:$each_ukt['id_ukt'],
                                                                'fk_kode_kelas_ukt'	=> $each_ukt['fk_kode_kelas_ukt'],
                                                                'fk_kelas_ukt'	    => $each_ukt['fk_kelas_ukt'],
                                                                'flag_bidik_misi'	=> $each_ukt['flag_bidik_misi'],
                                                                'total_tagihan'	    => $each_ukt['total_tagihan'],
                                                                'nominal_ukt_spp'	=> $each_ukt['nominal_ukt_spp'],
                                                                'jumlah_spi'	    => $each_ukt['jumlah_spi'],
                                                                'jumlah_denda'	    => $each_ukt['jumlah_denda'],
                                                                'jumlah_lainnya'	=> $each_ukt['jumlah_lainnya'],
                                                                'flag_keringanan'	=> $each_ukt['flag_keringanan'],
                                                                'prosentase_keringanan'	=> $each_ukt['prosentase_keringanan'],
                                                                'jumlah_keringanan'	=> $each_ukt['jumlah_keringanan'],
                                                                'flag_bayar'	=> $each_ukt['flag_bayar'],
                                                                'fk_flag_bayar'	=> $each_ukt['fk_flag_bayar'],
                                                            ]);
                                                        }
                                                    }
                                                    echo " (OK)\n";
                                                } else {
                                                    echo " (RIWAYAT UKT TIDAK ADA)\n";
                                                }
                                            }
                                        } else {
                                            echo " (DATA UKT TIDAK ADA)\n";
                                        }
                                    }
                                }
                            }
                        }
                    } catch (Exception $e) {
                        $response = '';
                    } catch (SoapFault $e) {
                        $response = '';
                    }
                    if($response['error_code'] == '0'){
                        return [
                            'status'    => 'success',
                            'data'      => $response['result'][0]
                        ];
                    } else {
                        return [
                            'status'    => 'error',
                            'error_code'=> $response['error_code'],
                            'data'      => [],
                            'error_desc'=> $response['error_desc']
                        ];
                    }
                }
            }
        }
    }
}
