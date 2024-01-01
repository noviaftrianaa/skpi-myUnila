<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;

use DB;
use App\Models\User;
use App\Models\Peran;
use App\Models\RolePengguna;
use App\Models\UnitOrganisasi;

class UpdateSsoSeeder extends Seeder
{

    public function run()
    {
        $query = "
                SELECT
                *,
                    (
                        SUBSTR(
                            email,
                            INSTR(email, '@') + 1,
                            LENGTH(email) - (INSTR(email, '@') + 7) - LENGTH(SUBSTRING_INDEX(email, '.', -2))
                        )
                    ) AS domain_email
                FROM
                    radcheck
                WHERE
                    status = 'Dosen'
            ";
        $result = DB::connection('mysql')->select(DB::raw($query));
        $total_data = count($result);

        $uuid = guid();
        foreach ($result as $no => $each_data) {
            echo "Mendapatkan data username: ".$each_data->username." peran: ".$each_data->status." no_induk: ".$each_data->nip." no: ".$no."/".$total_data."\n";

            if(isset($each_data->email)){
                //set peran
                if($each_data->domain_email == 'students'){
                    //mahasiswa
                    $id_peran = 39;
                    if(isset($each_data->nip)){
                        $query_reg_pd = " SELECT id_pd, nipd, id_sms FROM pdrd.reg_pd where soft_delete = 0 AND nipd = '".$each_data->nip."' ";
                        $reg_pd = collect(DB::connection('sqlsrv')->select(DB::raw($query_reg_pd)))->first();
                        if(!is_null($reg_pd)){
                            $id_pd_pengguna = $reg_pd->id_pd;
                            $organisasi = UnitOrganisasi::where('id_lembaga_asal', $reg_pd->id_sms)->where('soft_delete', 0)->first();
                            if(!is_null($organisasi)){
                                $id_organisasi = $organisasi->id_organisasi;
                            }else{
                                $id_organisasi = 'e2b705a7-173e-464a-9fac-509128709515';
                            }
                        }else{
                            $id_pd_pengguna = null;
                        }
                    }
                }elseif($each_data->domain_email == 'staff'){
                    //tendik
                    $id_peran = 111;
                    $id_organisasi = 'e2b705a7-173e-464a-9fac-509128709515';
                }else{
                    //dosen
                    $query_sdm = " SELECT id_sdm FROM pdrd.sdm where soft_delete = 0 AND nip = '".$each_data->nip."' ";
                    $sdm = collect(DB::connection('sqlsrv')->select(DB::raw($query_sdm)))->first();
                    if(!is_null($sdm)){
                        $id_sdm_pengguna = $sdm->id_sdm;
                    }else{
                        $id_sdm_pengguna = null;
                    }

                    $query_sms = " SELECT id_sms, singkatan FROM pdrd.sms where soft_delete = 0 AND singkatan IS NOT NULL AND singkatan = '".$each_data->domain_email."' ";
                    $sms = collect(DB::connection('sqlsrv')->select(DB::raw($query_sms)))->first();
                    if(!is_null($sms)){
                        $id_peran = 46;
                        $organisasi = UnitOrganisasi::where('id_lembaga_asal', $sms->id_sms)->where('soft_delete', 0)->first();
                        $id_organisasi = $organisasi->id_organisasi;
                    }else{
                        $id_organisasi = 'e2b705a7-173e-464a-9fac-509128709515';
                    }
                }

                $cek_user = User::where('username', $each_data->username)->where('soft_delete', 0)->first();
                if(!is_null($cek_user)){
                    $data = $cek_user->update([
                        'nm_pengguna'   => $each_data->nm_pengguna,
                        'username'      => $each_data->username,
                        'password'      => $each_data->value,
                        // 'jenis_kelamin' => $each_data->jenis_kelamin,
                        // 'tempat_lahir'  => $each_data->tempat_lahir,
                        'tgl_lahir'     => $each_data->tanggal_lahir,
                        'email'     => $each_data->email,
                        // 'alamat'        => $each_data->alamat,
                        // 'jabatan'       => $each_data->jabatan,
                        // 'no_tel'        => $each_data->no_tel,
                        // 'no_hp'         => $each_data->no_hp,
                        'id_sdm_pengguna'     => $id_sdm_pengguna ?? null,
                        'id_pd_pengguna'     => $id_pd_pengguna ?? null,
                        'last_update'   => currDateTime(),
                        'last_sync'     => currDateTime(),
                        'id_updater'    => $uuid,
                        'soft_delete'   => 0
                    ]);

                    $cek_role = RolePengguna::where('id_pengguna', $cek_user->id_pengguna)->where('id_peran', $id_peran)->where('soft_delete', 0)->first();
                    if(!is_null($cek_role)){
                        $role = $cek_role->update([
                            'id_organisasi' => $id_organisasi,
                            'id_peran' => $id_peran,
                            // 'sk_penugasan' => $sk_penugasan,
                            // 'tgl_sk_penugasan' => $tgl_sk_penugasan,
                            'last_update'   => currDateTime(),
                            'last_sync'     => currDateTime(),
                            'id_updater'    => $uuid,
                            'soft_delete'   => 0,
                            'id_updater' => $cek_user->id_pengguna,
                        ]);
                    }else{
                        $role = RolePengguna::create([
                            'id_role_pengguna' => guid(),
                            'id_pengguna' => $cek_user->id_pengguna,
                            'id_organisasi' => $id_organisasi,
                            'id_peran' => $id_peran,
                            // 'sk_penugasan' => $sk_penugasan,
                            // 'tgl_sk_penugasan' => $tgl_sk_penugasan,
                            'approval_peran' => 1,
                            'tgl_create' => currDateTime(),
                            'last_active' => currDateTime(),
                            'last_update' => currDateTime(),
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                            'id_updater' => $cek_user->id_pengguna,
                        ]);
                    }

                    echo "Data sudah ada, berhasil diupdate username: ".$cek_user->username." peran ".$id_peran." --------------\n";

                }else{
                    $data = User::lock('WITH(NOLOCK)')->create([
                        'id_pengguna'   => $uuid,
                        'nm_pengguna'   => $each_data->nm_pengguna,
                        'username'      => $each_data->username,
                        'password'      => $each_data->value,
                        'jenis_kelamin' => 'L',
                        // 'tempat_lahir'  => $each_data->tempat_lahir,
                        'tgl_lahir'     => $each_data->tanggal_lahir,
                        'email'     => $each_data->email,
                        // 'alamat'        => $each_data->alamat,
                        // 'jabatan'       => $each_data->jabatan,
                        // 'no_tel'        => $each_data->no_tel,
                        // 'no_hp'         => $each_data->no_hp,
                        'id_sdm_pengguna'     => $id_sdm_pengguna,
                        'id_pd_pengguna'     => $id_pd_pengguna,
                        'approval_pengguna' => 1,
                        'a_aktif'       => 1,
                        'disable'       => 0,
                        'tgl_create'    => currDateTime(),
                        'last_update'   => currDateTime(),
                        'last_sync'     => currDateTime(),
                        'id_updater'    => $uuid,
                        'soft_delete'   => 0
                    ]);

                    $role = RolePengguna::create([
                        'id_role_pengguna' => guid(),
                        'id_pengguna' => $data->id_pengguna,
                        'id_organisasi' => $id_organisasi,
                        'id_peran' => $id_peran,
                        // 'sk_penugasan' => $sk_penugasan,
                        // 'tgl_sk_penugasan' => $tgl_sk_penugasan,
                        'approval_peran' => 1,
                        'tgl_create' => currDateTime(),
                        'last_active' => currDateTime(),
                        'last_update' => currDateTime(),
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                        'id_updater' => $data->id_pengguna,
                    ]);

                    echo "Data berhasil disimpan username: ".$data->username." peran ".$role->id_peran."\n";
                }
            }

        }
    }
}
