<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Services\DraftSuratService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Manage template surat editable (tipe_template = html_editable).
 * Body HTML disimpan di ref.template_dokumen.body_html.
 * Layout induk (kop, judul, TTD, footer) tetap di Blade.
 */
class TemplateSuratController extends Controller
{
    use ApiResponse;

    /**
     * List template editable untuk semua jenis layanan surat mandiri yang punya template.
     */
    public function index(): JsonResponse
    {
        try {
            $rows = DB::connection('pgsql')->select("
                SELECT
                    td.id_template,
                    td.id_jenis_layanan,
                    jl.kode_layanan,
                    jl.nm_layanan,
                    td.nm_template,
                    td.versi,
                    td.body_html,
                    td.body_default,
                    td.a_aktif,
                    td.updated_at,
                    (td.body_html IS DISTINCT FROM td.body_default) AS is_modified
                FROM ref.template_dokumen td
                JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = td.id_jenis_layanan
                WHERE td.tipe_template = 'html_editable'
                  AND td.soft_delete = false
                ORDER BY jl.kode_layanan
            ");
            return $this->successResponse($rows);
        } catch (\Exception $e) {
            Log::error('TemplateSurat.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Detail template by id_template.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $row = DB::connection('pgsql')->selectOne("
                SELECT td.*, jl.kode_layanan, jl.nm_layanan
                FROM ref.template_dokumen td
                JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = td.id_jenis_layanan
                WHERE td.id_template = ? AND td.soft_delete = false
            ", [$id]);
            if (!$row) return $this->notFoundResponse();
            return $this->successResponse($row);
        } catch (\Exception $e) {
            Log::error('TemplateSurat.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Update body_html template.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'body_html' => 'required|string',
                'nm_template' => 'nullable|string|max:200',
                'a_aktif' => 'boolean',
            ]);

            $existing = DB::connection('pgsql')->selectOne(
                "SELECT id_template FROM ref.template_dokumen WHERE id_template = ? AND soft_delete = false",
                [$id]
            );
            if (!$existing) return $this->notFoundResponse();

            DB::connection('pgsql')->update("
                UPDATE ref.template_dokumen
                SET body_html = ?,
                    nm_template = COALESCE(?, nm_template),
                    a_aktif = COALESCE(?, a_aktif),
                    updated_at = NOW()
                WHERE id_template = ?
            ", [
                $data['body_html'],
                $data['nm_template'] ?? null,
                $data['a_aktif'] ?? null,
                $id,
            ]);

            return $this->successResponse(null, 'Template berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('TemplateSurat.update: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Reset body_html ke body_default.
     */
    public function reset(string $id): JsonResponse
    {
        try {
            $row = DB::connection('pgsql')->selectOne(
                "SELECT body_default FROM ref.template_dokumen WHERE id_template = ? AND soft_delete = false",
                [$id]
            );
            if (!$row) return $this->notFoundResponse();

            DB::connection('pgsql')->update(
                "UPDATE ref.template_dokumen SET body_html = body_default, updated_at = NOW() WHERE id_template = ?",
                [$id]
            );
            return $this->successResponse(null, 'Template di-reset ke default');
        } catch (\Exception $e) {
            Log::error('TemplateSurat.reset: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Preview PDF dengan body_html dari request (saat user masih edit di CKEditor) atau dari DB.
     */
    public function preview(Request $request, string $id)
    {
        try {
            $template = DB::connection('pgsql')->selectOne(
                "SELECT id_jenis_layanan FROM ref.template_dokumen WHERE id_template = ? AND soft_delete = false",
                [$id]
            );
            if (!$template) return $this->notFoundResponse();

            $bodyOverride = $request->input('body_html'); // optional — kirim saat user edit live
            $service = new DraftSuratService();
            $pdf = $service->generatePreview($template->id_jenis_layanan, $bodyOverride);

            return response($pdf, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="Preview-Template.pdf"',
                'Cache-Control' => 'no-store',
            ]);
        } catch (\Exception $e) {
            Log::error('TemplateSurat.preview: ' . $e->getMessage());
            return $this->errorResponse('Gagal preview: ' . $e->getMessage(), 500);
        }
    }
}
