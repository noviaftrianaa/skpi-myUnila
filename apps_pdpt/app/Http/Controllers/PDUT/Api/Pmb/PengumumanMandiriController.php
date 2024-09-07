<?php

namespace App\Http\Controllers\PDUT\Api\Pmb;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengumumanMandiriController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function getAllPengumuman()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50'
        ]);

        $sortby = $this->request->input('sortby', 'DESC');
        try {
            $query =  "
                SELECT
                    id_pengumuman,
                    id_thn_ajaran,
                    no_peserta,
                    nm_peserta,
                    tgl_lahir,
                    jns_kelamin,
                    nm_slta,
                    prov_slta,
                    wil_tmpt_tinggal,
                    jenis_pendaftaran,
                    status_lulus,
                    fak_lulus,
                    prodi_lulus,
                    kuota,
                    pil_lulus,
                    prodi_pilihan_1,
                    prodi_pilihan_2,
                    prodi_pilihan_3,
                    prodi_pilihan_4,
                    nilai_utbk,
                    nilai_wawancara,
                    last_sync
                FROM
                    temp_pmb.pengumuman WITH(NOLOCK)
                WHERE
                    soft_delete = 0
                ORDER BY
                    nm_peserta " . $sortby . "
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'Data pengumuman tidak ditemukan', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = (array) $value;
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "Tidak dapat mengambil data pengumuman", FALSE);
        }
    }

    public function tambahPengumuman()
    {
        InputValidator([
            'id_thn_ajaran' => 'required|numeric',
            'no_peserta' => 'required|string|max:24',
            'nm_peserta' => 'required|string',
            'tgl_lahir' => 'required|date',
            'jns_kelamin' => 'required|in:L,P',
            'nm_slta' => 'required|string',
            'prov_slta' => 'required|string|max:60',
            'wil_tmpt_tinggal' => 'required|string',
            'jenis_pendaftaran' => 'required|string',
            'status_lulus' => 'required|string',
            'fak_lulus' => 'nullable|uuid',
            'prodi_lulus' => 'nullable|uuid',
            'kuota' => 'nullable|numeric',
            'pil_lulus' => 'nullable|numeric',
            'prodi_pilihan_1' => 'nullable|uuid',
            'prodi_pilihan_2' => 'nullable|uuid',
            'prodi_pilihan_3' => 'nullable|uuid',
            'prodi_pilihan_4' => 'nullable|uuid',
            'nilai_utbk' => 'nullable|numeric|max:999.99',
            'nilai_wawancara' => 'nullable|numeric|max:999.99',
        ]);

        $creatorId = '26004417-6e92-463c-bf35-f741817121dc';

        $existingData = DB::table('temp_pmb.pengumuman')
            ->where('no_peserta', $this->request->input('no_peserta'))
            ->where('id_thn_ajaran', $this->request->input('id_thn_ajaran'))
            ->where('soft_delete', 0)
            ->first();

        $id_pengumuman = $existingData ? $existingData->id_pengumuman : guid();
        $data = [
            'id_pengumuman' => $id_pengumuman,
            'id_thn_ajaran' => $this->request->input('id_thn_ajaran'),
            'no_peserta' => $this->request->input('no_peserta'),
            'nm_peserta' => $this->request->input('nm_peserta'),
            'tgl_lahir' => $this->request->input('tgl_lahir'),
            'jns_kelamin' => $this->request->input('jns_kelamin'),
            'nm_slta' => $this->request->input('nm_slta'),
            'prov_slta' => $this->request->input('prov_slta'),
            'wil_tmpt_tinggal' => $this->request->input('wil_tmpt_tinggal'),
            'jenis_pendaftaran' => $this->request->input('jenis_pendaftaran'),
            'status_lulus' => $this->request->input('status_lulus'),
            'fak_lulus' => $this->request->input('fak_lulus'),
            'prodi_lulus' => $this->request->input('prodi_lulus'),
            'kuota' => $this->request->input('kuota'),
            'pil_lulus' => $this->request->input('pil_lulus'),
            'nilai_utbk' => $this->request->input('nilai_utbk'),
            'nilai_wawancara' => $this->request->input('nilai_wawancara'),
            'create_date' => currDateTime(),
            'id_creator' => $creatorId,
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
        ];

        $prodiPilihanFields = [
            'prodi_pilihan_1',
            'prodi_pilihan_2',
            'prodi_pilihan_3',
            'prodi_pilihan_4'
        ];

        foreach ($prodiPilihanFields as $field) {
            $prodiValue = $this->request->input($field);
            if ($prodiValue && !DB::table('pdrd.sms')->where('id_sms', $prodiValue)->exists()) {
                $data[$field] = null;
            } else {
                $data[$field] = $prodiValue;
            }
        }


        DB::beginTransaction();
        try {
            DB::table('temp_pmb.pengumuman')->updateOrInsert(
                [
                    'no_peserta' => $this->request->input('no_peserta'),
                    'id_thn_ajaran' => $this->request->input('id_thn_ajaran')
                ],
                $data
            );

            DB::commit();
            return WrapResponse(['data' => ['id_pengumuman' => $id_pengumuman]], 'sukses menambahkan atau memperbarui pengumuman', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan atau memperbarui pengumuman', FALSE);
        }
    }


    public function ubahPengumuman()
    {
        InputValidator([
            'id_pengumuman' => 'required|uuid',
            'id_thn_ajaran' => 'required|numeric',
            'no_peserta' => 'required|string|max:24',
            'nm_peserta' => 'required|string',
            'tgl_lahir' => 'required|date',
            'jns_kelamin' => 'required|in:L,P',
            'nm_slta' => 'required|string',
            'prov_slta' => 'required|string|max:60',
            'wil_tmpt_tinggal' => 'required|string',
            'jenis_pendaftaran' => 'required|string',
            'status_lulus' => 'required|string',
            'fak_lulus' => 'nullable|uuid',
            'prodi_lulus' => 'nullable|uuid',
            'kuota' => 'nullable|numeric',
            'pil_lulus' => 'nullable|numeric|max:9',
            'prodi_pilihan_1' => 'nullable|uuid',
            'prodi_pilihan_2' => 'nullable|uuid',
            'prodi_pilihan_3' => 'nullable|uuid',
            'prodi_pilihan_4' => 'nullable|uuid',
            'nilai_utbk' => 'nullable|numeric|max:999.99',
            'nilai_wawancara' => 'nullable|numeric|max:999.99',
        ]);

        $id_pengumuman = $this->request->input('id_pengumuman');

        $data = [
            'id_thn_ajaran' => $this->request->input('id_thn_ajaran'),
            'no_peserta' => $this->request->input('no_peserta'),
            'nm_peserta' => $this->request->input('nm_peserta'),
            'tgl_lahir' => $this->request->input('tgl_lahir'),
            'jns_kelamin' => $this->request->input('jns_kelamin'),
            'nm_slta' => $this->request->input('nm_slta'),
            'prov_slta' => $this->request->input('prov_slta'),
            'wil_tmpt_tinggal' => $this->request->input('wil_tmpt_tinggal'),
            'jenis_pendaftaran' => $this->request->input('jenis_pendaftaran'),
            'status_lulus' => $this->request->input('status_lulus'),
            'fak_lulus' => $this->request->input('fak_lulus'),
            'prodi_lulus' => $this->request->input('prodi_lulus'),
            'kuota' => $this->request->input('kuota'),
            'pil_lulus' => $this->request->input('pil_lulus'),
            'nilai_utbk' => $this->request->input('nilai_utbk'),
            'nilai_wawancara' => $this->request->input('nilai_wawancara'),
            'last_sync' => currDateTime(),
        ];

        $prodiPilihanFields = [
            'prodi_pilihan_1',
            'prodi_pilihan_2',
            'prodi_pilihan_3',
            'prodi_pilihan_4'
        ];

        foreach ($prodiPilihanFields as $field) {
            $prodiValue = $this->request->input($field);
            if ($prodiValue && !DB::table('pdrd.sms')->where('id_sms', $prodiValue)->exists()) {
                $data[$field] = null;
            } else {
                $data[$field] = $prodiValue;
            }
        }

        DB::beginTransaction();
        try {
            $affected = DB::table('temp_pmb.pengumuman')
                ->where('id_pengumuman', $id_pengumuman)
                ->where('soft_delete', 0)
                ->update($data);

            if ($affected == 0) {
                throw new ModelNotFoundException('Data pengumuman tidak ditemukan atau tidak diubah');
            }

            DB::commit();
            return WrapResponse([], 'sukses memperbarui pengumuman', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal memperbarui pengumuman', FALSE);
        }
    }


    public function hapusPengumuman()
    {
        InputValidator([
            'id_pengumuman' => 'required|uuid'
        ]);

        $id_pengumuman = $this->request->input('id_pengumuman');

        DB::beginTransaction();
        try {
            $affected = DB::table('temp_pmb.pengumuman')
                ->where('id_pengumuman', $id_pengumuman)
                ->where('soft_delete', 0)
                ->update([
                    'soft_delete' => 1,
                    'last_sync' => currDateTime()
                ]);

            if ($affected == 0) {
                throw new ModelNotFoundException('Data pengumuman tidak ditemukan atau sudah dihapus');
            }

            DB::commit();
            return WrapResponse([], 'sukses menghapus pengumuman', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus pengumuman', FALSE);
        }
    }
}
