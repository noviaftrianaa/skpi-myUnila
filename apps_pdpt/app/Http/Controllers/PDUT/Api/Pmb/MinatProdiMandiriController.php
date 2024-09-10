<?php

namespace App\Http\Controllers\PDUT\Api\Pmb;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MinatProdiMandiriController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function getAllMinatProdi()
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
                    id_minat_prodi,
                    id_thn_ajaran,
                    id_prodi,
                    kategori,
                    jml_peminat,
                    create_date,
                    id_creator,
                    last_update,
                    id_updater,
                    soft_delete,
                    last_sync
                FROM
                    temp_pmb.minat_prodi WITH(NOLOCK)
                WHERE
                    soft_delete = 0
                ORDER BY
                    kategori " . $sortby . "
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'Data minat prodi tidak ditemukan', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = (array) $value;
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "Tidak dapat mengambil data minat prodi", FALSE);
        }
    }

    public function tambahMinatProdi()
    {
        InputValidator([
            'id_thn_ajaran' => 'required|numeric',
            'id_prodi' => 'required|uuid',
            'kategori' => 'required|string|max:50',
            'jml_peminat' => 'required|numeric|min:0',
        ]);

        $creatorId = '26004417-6e92-463c-bf35-f741817121dc';

        $existingData = DB::table('temp_pmb.minat_prodi')
            ->where('id_thn_ajaran', $this->request->input('id_thn_ajaran'))
            ->where('id_prodi', $this->request->input('id_prodi'))
            ->where('soft_delete', 0)
            ->first();

        $id_minat_prodi = $existingData ? $existingData->id_minat_prodi : guid();
        $data = [
            'id_minat_prodi' => $id_minat_prodi,
            'id_thn_ajaran' => $this->request->input('id_thn_ajaran'),
            'id_prodi' => $this->request->input('id_prodi'),
            'kategori' => $this->request->input('kategori'),
            'jml_peminat' => $this->request->input('jml_peminat'),
            'create_date' => currDateTime(),
            'id_creator' => $creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $creatorId,
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            DB::table('temp_pmb.minat_prodi')->updateOrInsert(
                [
                    'id_thn_ajaran' => $this->request->input('id_thn_ajaran'),
                    'id_prodi' => $this->request->input('id_prodi')
                ],
                $data
            );

            DB::commit();
            return WrapResponse(['data' => ['id_minat_prodi' => $id_minat_prodi]], 'sukses menambahkan atau memperbarui minat prodi', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan atau memperbarui minat prodi', FALSE);
        }
    }

    public function ubahMinatProdi()
    {
        InputValidator([
            'id_minat_prodi' => 'required|uuid',
            'id_thn_ajaran' => 'required|numeric',
            'id_prodi' => 'required|uuid',
            'kategori' => 'required|string|max:50',
            'jml_peminat' => 'required|numeric|min:0',
        ]);

        $id_minat_prodi = $this->request->input('id_minat_prodi');

        $data = [
            'id_thn_ajaran' => $this->request->input('id_thn_ajaran'),
            'id_prodi' => $this->request->input('id_prodi'),
            'kategori' => $this->request->input('kategori'),
            'jml_peminat' => $this->request->input('jml_peminat'),
            'last_update' => currDateTime(),
            'id_updater' => '26004417-6e92-463c-bf35-f741817121dc',
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $affected = DB::table('temp_pmb.minat_prodi')
                ->where('id_minat_prodi', $id_minat_prodi)
                ->where('soft_delete', 0)
                ->update($data);

            if ($affected == 0) {
                throw new ModelNotFoundException('Data minat prodi tidak ditemukan atau tidak diubah');
            }

            DB::commit();
            return WrapResponse([], 'sukses memperbarui minat prodi', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal memperbarui minat prodi', FALSE);
        }
    }

    public function hapusMinatProdi()
    {
        InputValidator([
            'id_minat_prodi' => 'required|uuid'
        ]);

        $id_minat_prodi = $this->request->input('id_minat_prodi');

        DB::beginTransaction();
        try {
            $affected = DB::table('temp_pmb.minat_prodi')
                ->where('id_minat_prodi', $id_minat_prodi)
                ->where('soft_delete', 0)
                ->update([
                    'soft_delete' => 1,
                    'last_sync' => currDateTime()
                ]);

            if ($affected == 0) {
                throw new ModelNotFoundException('Data minat prodi tidak ditemukan atau sudah dihapus');
            }

            DB::commit();
            return WrapResponse([], 'sukses menghapus minat prodi', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus minat prodi', FALSE);
        }
    }
}

