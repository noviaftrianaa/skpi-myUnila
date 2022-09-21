<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use DB;
use App\Models\User;
use Auth;

class PenggunaController extends Controller
{
    
    protected $request;
    protected $pengguna;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->pengguna = new User();
    }

    public function list(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('limit', 50);
        $sortBy = $request->input('sort_by', 'ASC');

        InputValidator([
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
        ], [
            'sort_by.alpha' => 'input penyortiran harus kata',
            'sort_by.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET
                @PageNumber = ?
            SET
                @RowsOfPage = ?
            SELECT
                *
            FROM
                man_akses.pengguna
            WHERE
                soft_delete = 0
            ORDER BY
                username " . $sortBy . "
            OFFSET (@PageNumber -1) *
            @RowsOfPage ROWS FETCH NEXT
            @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'username'              => $each_data->username,
                'nm_pengguna'           => $each_data->nm_pengguna,
                'email'                 => $each_data->email,
                'approval'              => $each_data->approval_pengguna,
                'status_aktif'          => $each_data->a_aktif,
                'id_pegawai'            => $each_data->id_sdm_pengguna,
                'id_mahasiswa'          => $each_data->id_pd_pengguna,
                'tgl_ganti_password'    => $each_data->tgl_ganti_pwd,
                'soft_delete'           => $each_data->soft_delete,
                'tgl_dibuat'            => TglWaktuIndonesia($each_data->tgl_create),
                'terakhir_update'       => TglWaktuIndonesia($each_data->last_update)
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list Pengguna');
    }

    public function password()
    {
        InputValidator([
            'id_pengguna'           => 'required|string',
            'password'              => 'required|string|min:8',
        ]);

        $id_pengguna = $this->request->input('id_pengguna');
        $password = $this->request->input('password');
        $tgl_ganti_pwd = date('Y-m-d');
        $last_update = currDateTime();
        $id_updater = $id_pengguna;

        DB::beginTransaction();

        try {
            $data = $this->pengguna->where('id_pengguna', $id_pengguna)->first();
            if (!$data) return WrapResponse(['data' => null], 'ID Pengguna tidak ditemukan atau tidak terdaftar', FALSE);

            $data->update([
                'password'      => SHA1($password),
                'tgl_ganti_pwd' => $tgl_ganti_pwd,
                'last_sync'     => $last_sync,
                'id_updater'    => $id_updater
            ]);
            
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'password pengguna gagal diubah', FALSE);
        }
        return WrapResponse(['data' => $data], 'password pengguna berhasil diubah', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_pengguna'           => 'nullable|string',
            'username'              => 'required|string',
            'password'              => 'required|string',
            'nm_pengguna'           => 'nullable|string',
            'email'                 => 'nullable|string',
            'tempat_lahir'          => 'nullable|string',
            'tgl_lahir'             => 'nullable|date',
            'jenis_kelamin'         => 'required|integer',
            'alamat'                => 'nullable|string',
            'no_tel'                => 'nullable|string',
            'no_hp'                 => 'nullable|string',
            'id_sdm_pengguna'       => 'nullable|string',
            'id_pd_pengguna'        => 'nullable|string',
            'id_calon_pd_pengguna'  => 'nullable|string',
            'token_reg'             => 'nullable|string',
            'jabatan'               => 'nullable|string',
            'provider'              => 'nullable|string',
            'id_updater'            => 'nullable|string'
        ]);

        $id_pengguna            = $this->request->input('id_pengguna') ?? guid();
        $username               = $this->request->input('username');
        $password               = SHA1($this->request->input('password'));
        $nm_pengguna            = $this->request->input('nm_pengguna') ?? null;
        $email                  = $this->request->input('email') ?? null;
        $tempat_lahir           = $this->request->input('tempat_lahir') ?? null;
        $tgl_lahir              = $this->request->input('tgl_lahir') ?? null;
        $jenis_kelamin          = $this->request->input('jenis_kelamin') ?? 'l';
        $alamat                 = $this->request->input('alamat') ?? null;
        $no_tel                 = $this->request->input('no_tel') ?? null;
        $no_hp                  = $this->request->input('no_hp') ?? null;
        $id_sdm_pengguna        = $this->request->input('id_sdm_pengguna') ?? null;
        $id_pd_pengguna         = $this->request->input('id_pd_pengguna') ?? null;
        $id_calon_pd_pengguna   = $this->request->input('id_calon_pd_pengguna') ?? null;
        $token_reg              = $this->request->input('token_reg') ?? null;
        $jabatan                = $this->request->input('jabatan') ?? null;
        $provider               = $this->request->input('provider') ?? null;
        $approval_pengguna      = 1;
        $a_aktif                = 1;
        $disable                = 0;
        $tgl_create             = currDateTime();
        $last_update            = currDateTime();
        $soft_delete            = 0;
        $last_sync              = currDateTime();
        $id_updater             = $this->request->input('id_updater') ?? $id_pengguna;

        DB::beginTransaction();

        try {

            $data = $this->pengguna->updateOrCreate([
                'username'              => $username
            ], [
                'id_pengguna'           => $id_pengguna,
                'password'              => $password,
                'nm_pengguna'           => $nm_pengguna,
                'email'                 => $email,
                'tempat_lahir'          => $tempat_lahir,
                'tgl_lahir'             => $tgl_lahir,
                'jenis_kelamin'         => $jenis_kelamin,
                'alamat'                => $alamat,
                'no_tel'                => $no_tel,
                'no_hp'                 => $no_hp,
                'id_sdm_pengguna'       => $id_sdm_pengguna,
                'id_pd_pengguna'        => $id_pd_pengguna,
                'id_calon_pd_pengguna'  => $id_calon_pd_pengguna,
                'approval_pengguna'     => $approval_pengguna,
                'token_reg'             => $token_reg,
                'jabatan'               => $jabatan,
                'provider'              => $provider,
                'a_aktif'               => $a_aktif,
                'disable'               => $disable,
                'tgl_create'            => $tgl_create,
                'last_update'           => $last_update,
                'soft_delete'           => $soft_delete,
                'last_sync'             => $last_sync,
                'id_updater'            => $id_updater
            ]);
            DB::commit();
            return WrapResponse(array('data' => $data), 'sukses menambahkan pengguna', TRUE);

        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data'=>null], 'pengguna tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data'=>$data['username']], 'username telah terdaftar', FALSE);
        }
    }

    public function reset()
    {
        InputValidator([
            'id_pengguna'           => 'required|string',
            'password'              => 'required|string',
            'id_updater'            => 'required|string'
        ]);

        $id_pengguna            = $this->request->input('id_pengguna');
        $password               = SHA1($this->request->input('password'));
        $last_update            = currDateTime();
        $last_sync              = currDateTime();
        $id_updater             = $this->request->input('id_updater');

        try {
            $data = $this->pengguna->where('id_pengguna', $id_pengguna)->first();
            if (!$user) return WrapResponse(['data' => null], 'ID Pengguna tidak ditemukan atau tidak terdaftar', FALSE);

            $data->update([
                'password'      => $password,
                'last_update'   => $last_update,
                'last_sync'     => $last_sync,
                'id_updater'    => $id_updater
            ]);
            
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'password pengguna gagal direset', FALSE);
        }
        return WrapResponse(['data' => $data], 'password pengguna berhasil direset', TRUE);
    }

}
