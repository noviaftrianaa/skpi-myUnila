<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Peran;
use Illuminate\Support\Facades\Log;
use DB;

class manAksesController extends Controller
{
    protected $request;
    protected $rolePengguna;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->pengguna = new User();
        $this->rolePengguna = new Peran();
    }

    public function peran()
    {

        InputValidator([
            'id_pengguna' => 'required|uuid',
        ]);

        $id_pengguna = $this->request->input('id_pengguna');

        try {
            $query1 = collect(DB::SELECT("
                SELECT
                    pengguna.id_pengguna,
                    pengguna.username,
                    pengguna.nm_pengguna,
                    pengguna.tgl_create AS akun_terdaftar,
                    pj.id_pj_aplikasi,
                    pj.id_aplikasi,
                    pj.waktu_selesai,
                    pj.tanggal_mulai_pj,
                    pj.jabatan_pj
                FROM
                    man_akses.pengguna AS pengguna
                    LEFT JOIN (
                        SELECT pj.id_pengguna, pj.id_pj_aplikasi, pj.id_aplikasi, pj.wkt_selesai AS waktu_selesai, pj.tgl_create AS tanggal_mulai_pj, pj.jabatan_pj
                        FROM
                            man_akses.aplikasi AS aplikasi
                            JOIN man_akses.pj_aplikasi AS pj ON pj.id_aplikasi=aplikasi.id_aplikasi
                        WHERE aplikasi.id_aplikasi = '" . env('APP_ID') . "'
                    ) AS pj ON pj.id_pengguna=pengguna.id_pengguna
                WHERE
                    pengguna.id_pengguna = '" . $id_pengguna . "'
                    AND pengguna.soft_delete = 0
            "))->unique('id_pengguna');

            if (empty($query1)) {
                return WrapResponse(['data' => null], 'gagal, id_pengguna tidak terdaftar ', FALSE);
            }

            $status_peran = [];
            $pj_aplikasi = [];
            foreach ($query1 as $each_data) {
                $id =  $each_data->id_pengguna;
                $status_peran[$id] = DB::SELECT("
                    SELECT
                        role.id_role_pengguna,
                        role.id_peran,
                        peran.nm_peran,
                        role.last_active AS terakhir_diakses
                    FROM
                        man_akses.role_pengguna AS role WITH(NOLOCK)
                        JOIN man_akses.peran AS peran WITH(NOLOCK) ON peran.id_peran = role.id_peran
                        AND peran.expired_date IS NULL
                    WHERE
                        role.id_pengguna = '" . $id . "'
                        AND role.soft_delete = 0
                    ORDER BY
                        last_active DESC
                ");
            }

            $data = [];
            foreach ($query1 as $each_data) {
                $data[] = [
                    'id_pengguna ' => $each_data->id_pengguna,
                    'username' => $each_data->username,
                    'nm_pengguna' => $each_data->nm_pengguna,
                    'akun_terdaftar' => $each_data->akun_terdaftar,
                    'id_pj_aplikasi' => $each_data->id_pj_aplikasi,
                    'id_aplikasi' => $each_data->id_aplikasi,
                    'jabatan_pj' => $each_data->jabatan_pj,
                    'tanggal_mulai_pj' => $each_data->tanggal_mulai_pj,
                    'waktu_selesai' => $each_data->waktu_selesai,
                    'status_peran' => $status_peran[$each_data->id_pengguna]
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'gagal mendapatkan peran', FALSE);
        }
        return WrapResponse(['data' => $data], 'berhasil mendapatkan status peran', TRUE);
    }

    public function updateLastActive()
    {
        InputValidator([
            'id_role_pengguna' => 'required|uuid',
        ]);

        $id_role_pengguna = $this->request->input('id_role_pengguna');
        $last_active = currDateTime();

        try {

            $role_pengguna = $this->rolePengguna->where('id_role_pengguna', $id_role_pengguna)->first();
            if (!$role_pengguna) return WrapResponse(['data' => null], 'id_role_pengguna tidak ditemukan atau tidak terdaftar', FALSE);

            $role_pengguna->update([
                'last_active' => $last_active
            ]);

            $query = DB::SELECT("
                    SELECT
                        role.id_pengguna,
                        role.id_role_pengguna,
                        pengguna.nm_pengguna,
                        role.id_peran,
                        peran.nm_peran,
                        pengguna.tgl_create AS akun_terdaftar,
                        role.last_active AS terakhir_diakses
                    FROM
                        man_akses.role_pengguna AS role WITH(NOLOCK)
                        JOIN man_akses.peran AS peran WITH(NOLOCK) ON peran.id_peran = role.id_peran
                        AND peran.expired_date IS NULL
                        JOIN man_akses.pengguna AS pengguna WITH(NOLOCK) ON pengguna.id_pengguna = role.id_pengguna
                        AND pengguna.soft_delete = 0
                    WHERE
                        role.id_role_pengguna = '" . $id_role_pengguna . "'
                        AND role.soft_delete = 0
                ");

            $data = [];
            foreach ($query as $each_data) {
                $data[] = [
                    'id_pengguna ' => $each_data->id_pengguna,
                    'id_role_pengguna' => $each_data->id_role_pengguna,
                    'nm_pengguna' => $each_data->nm_pengguna,
                    'id_peran' => $each_data->id_peran,
                    'nm_peran' => $each_data->nm_peran,
                    'akun_terdaftar' => $each_data->akun_terdaftar,
                    'terakhir_diakses' => $each_data->terakhir_diakses
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'gagal mendapatkan status keaktifan', FALSE);
        }
        return WrapResponse(['data' => $data], 'berhasil mendapatkan status keaktifan', TRUE);
    }
}
