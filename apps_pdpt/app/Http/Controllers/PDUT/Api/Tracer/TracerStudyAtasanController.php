<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RegPd;
use App\Models\PDUT\Ref\BidangPekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\HasilTracerStudy;
use App\Models\PDUT\Tracer\HasilTracerAtasan;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class TracerStudyAtasanController extends Controller
{

    public function index(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 50);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT("
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
                SELECT
                    reg.nipd AS npm,
                    pd.nm_pd AS nm_alumni,
                    tc_study_ats.id_hasil_tracer_atasan,
                    tc_study_ats.email_atasan,
                    tc_study_ats.nm_atasan,
                    wilayah.nm_wil,
                    negara.nm_negara,
                    tc_study_ats.jabatan_atasan,
                    tc_study_ats.nm_tmpt_bekerja,
                    tc_study_ats.bidang_tempat_bekerja,
                    tc_study_ats.saran,
                    tc_study_ats.harapan,
                    tc_study.create_date AS waktu_data_ditambahkan,
                    tc_study.last_update AS terakhir_diubah
                FROM
                    tracer.hasil_tracer_atasan AS tc_study_ats WITH(NOLOCK)
                    LEFT JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study_ats.id_wil
                    AND wilayah.expired_date IS NULL
                    LEFT JOIN ref.negara AS negara WITH(NOLOCK) ON negara.id_negara = tc_study_ats.id_negara
                    AND wilayah.expired_date IS NULL
                    LEFT JOIN tracer.hasil_tracer_study AS tc_study WITH(NOLOCK) ON tc_study.id_hasil_tracer_study = tc_study_ats.id_hasil_tracer_study
                    AND tc_study.soft_delete = 0
                    LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                    AND reg.soft_delete = 0
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    tc_study_ats.soft_delete = 0
                ORDER BY
                    tc_study.id_thn_ajaran DESC
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ", [$currentPage, $itemsPerPage]);

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_hasil_tracer_atasan' => $each_data->id_hasil_tracer_atasan,
                'npm' => $each_data->npm,
                'nm_atasan' => $each_data->nm_atasan,
                'email_atasan' => $each_data->email_atasan,
                'nm_negara' => $each_data->nm_negara,
                'nm_wil' => $each_data->nm_wil,
                'nm_negara' => $each_data->nm_negara,
                'jabatan_atasan' => $each_data->jabatan_atasan,
                'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
                'bidang_tempat_bekerja' => $each_data->bidang_tempat_bekerja,
                'saran' => $each_data->saran,
                'harapan' => $each_data->harapan,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'data'), 'Berhasil mengambil data list tracer study atasan');
    }

    public function store(Request $request)
    {

        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $get_data = $request->all();

        if (empty($get_data['data'])) {
            return WrapResponse([], 'Data kosonng silahkan diisi', FALSE);
        }

        DB::beginTransaction();
        try {
            $tracer = [];
            foreach ($get_data['data'] as $each_data) {

                $id_tracer = DB::select("
                    SELECT
                        id_hasil_tracer_study
                    FROM
                        tracer.hasil_tracer_study
                    WHERE
                        id_reg_pd = ?
                        AND id_thn_ajaran = ?
                        AND soft_delete = 0
                ", [$each_data['id_reg_pd'], $each_data['id_thn_ajaran']]);

                if (empty($id_tracer)) {
                    return WrapResponse([], "gagal menambahkan, Data alumni tidak ditemukan", FALSE);
                }

                HasilTracerAtasan::create([
                    'id_hasil_tracer_atasan' => guid(),
                    'id_hasil_tracer_study' => $id_tracer[0]->id_hasil_tracer_study,
                    'id_negara' => $each_data['id_negara'],
                    'id_wil' => $each_data['id_wil'],
                    'email_atasan' => $each_data['email_atasan'],
                    'nm_atasan' => $each_data['nm_atasan'],
                    'jabatan_atasan' => $each_data['jabatan_atasan'],
                    'nm_tmpt_bekerja' => $each_data['nm_tmpt_bekerja'],
                    'bidang_tempat_bekerja' => $each_data['nm_bid_kerja'],
                    'saran' => $each_data['saran'],
                    'harapan' => $each_data['harapan'],
                    'id_creator' => $id_creator,
                    'id_updater' => $id_creator,
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0
                ]);
            }

            DB::commit();
            $config = config('database.default');
            return WrapResponse([$config], 'sukses menambahkan tracer study atasan');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan tracer study atasan");
        }
    }

    public function update(Request $request)
    {
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';

        $id_hasil_tracer_atasan = $request->input('id_hasil_tracer_atasan');
        InputValidator([
            'id_hasil_tracer_atasan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_hasil_tracer_atasan.required' => 'field ini harus diisi',
            'id_hasil_tracer_atasan.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $data = HasilTracerAtasan::where('id_hasil_tracer_atasan', $id_hasil_tracer_atasan)->first();

            if (empty($data)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $data->update([
                'id_negara' => $request->id_negara,
                'id_wil' => $request->id_wil,
                'email_atasan' => $request->email_atasan,
                'nm_atasan' => $request->nm_atasan,
                'jabatan_atasan' => $request->jabatan_atasan,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
                'bidang_tempat_bekerja' => $request->nm_bid_kerja,
                'saran' => $request->saran,
                'harapan' => $request->harapan,
                'id_creator' => $id_creator,
                'id_updater' => $id_creator,
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse([], 'sukses memperbaharui tracer study atasan - ' . $data->id_hasil_tracer_atasan);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal memperbaharui tracer study atasan");
        }
    }

    public function destroy(Request $request)
    {
        $id_hasil_tracer_atasan = $request->input('id_hasil_tracer_atasan');
        InputValidator([
            'id_hasil_tracer_atasan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_hasil_tracer_atasan.required' => 'field ini harus diisi',
            'id_hasil_tracer_atasan.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_atasan', $id_hasil_tracer_atasan)->first();

            if (empty($hasil_tracer_study_atasan)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $hasil_tracer_study_atasan->update(['soft_delete' => 1]);

            DB::commit();
            return WrapResponse([], 'sukses menghapus tracer study atasan - ' . $hasil_tracer_study_atasan->id_hasil_tracer_atasan);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menghapus tracer study atasan");
        }
    }
}
