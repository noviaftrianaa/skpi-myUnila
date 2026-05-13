<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Services\MinioService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Manajemen template blanko untuk mahasiswa (tipe_template = 'blanko_mahasiswa').
 *
 * Workflow:
 * 1. Admin BAK upload file template (.docx/.pdf/.doc) via Master Data
 * 2. Mahasiswa download dari halaman form pengajuan, isi, lalu upload sebagai dokumen persyaratan
 *
 * Storage: MinIO via MinioService (path: simbak/template/{kode_layanan}/{filename}).
 */
class TemplateBlankoController extends Controller
{
    use ApiResponse;

    protected MinioService $minio;

    public function __construct()
    {
        $this->minio = new MinioService();
    }

    private const TIPE_TEMPLATE = 'blanko_mahasiswa';
    private const ALLOWED_MIMES = ['docx', 'doc', 'pdf'];
    private const MAX_SIZE_KB = 10240; // 10 MB

    /**
     * List template blanko (admin) — bisa difilter id_jenis_layanan.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $idJenis = $request->get('id_jenis_layanan');
            $params = [self::TIPE_TEMPLATE];
            $extra = '';
            if ($idJenis) {
                $extra = "AND td.id_jenis_layanan = ?";
                $params[] = $idJenis;
            }
            $rows = DB::connection('pgsql')->select("
                SELECT td.id_template, td.id_jenis_layanan, td.nm_template, td.versi,
                       td.path_file, td.tipe_file, td.a_aktif, td.keterangan, td.updated_at,
                       jl.kode_layanan, jl.nm_layanan
                FROM ref.template_dokumen td
                JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = td.id_jenis_layanan
                WHERE td.tipe_template = ? AND td.soft_delete = false
                  {$extra}
                ORDER BY jl.kode_layanan, td.created_at
            ", $params);
            return $this->successResponse($rows);
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * List template blanko untuk mahasiswa di halaman form pengajuan.
     */
    public function listForMahasiswa(string $idJenisLayanan): JsonResponse
    {
        try {
            $rows = DB::connection('pgsql')->select("
                SELECT id_template, nm_template, versi, tipe_file, keterangan, updated_at
                FROM ref.template_dokumen
                WHERE id_jenis_layanan = ?
                  AND tipe_template = ?
                  AND a_aktif = true
                  AND soft_delete = false
                ORDER BY created_at ASC
            ", [$idJenisLayanan, self::TIPE_TEMPLATE]);
            return $this->successResponse($rows);
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.listForMahasiswa: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Upload template baru.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'nm_template' => 'required|string|max:200',
                'versi' => 'nullable|string|max:20',
                'keterangan' => 'nullable|string',
                'file' => 'required|file|mimes:' . implode(',', self::ALLOWED_MIMES) . '|max:' . self::MAX_SIZE_KB,
            ]);

            // Get kode_layanan
            $jenis = DB::connection('pgsql')->selectOne(
                "SELECT kode_layanan FROM ref.jenis_layanan WHERE id_jenis_layanan = ?",
                [$data['id_jenis_layanan']]
            );
            if (!$jenis) return $this->errorResponse('Jenis layanan tidak ditemukan', 422);

            $file = $request->file('file');
            $path = $this->minio->uploadTemplate($jenis->kode_layanan, $file);

            $user = $request->user();
            $row = DB::connection('pgsql')->select("
                INSERT INTO ref.template_dokumen
                    (id_jenis_layanan, nm_template, versi, path_file, tipe_file, tipe_template, a_aktif, keterangan, id_creator)
                VALUES (?, ?, ?, ?, ?, ?, true, ?, ?)
                RETURNING id_template
            ", [
                $data['id_jenis_layanan'],
                $data['nm_template'],
                $data['versi'] ?? '1.0',
                $path,
                $file->getMimeType(),
                self::TIPE_TEMPLATE,
                $data['keterangan'] ?? null,
                $user->id_pengguna ?? null,
            ]);

            return $this->createdResponse(['id_template' => $row[0]->id_template ?? null], 'Template blanko berhasil diupload');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Update template — replace file atau ubah metadata.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = DB::connection('pgsql')->selectOne(
                "SELECT td.*, jl.kode_layanan FROM ref.template_dokumen td
                 JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = td.id_jenis_layanan
                 WHERE td.id_template = ? AND td.tipe_template = ? AND td.soft_delete = false",
                [$id, self::TIPE_TEMPLATE]
            );
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'nm_template' => 'nullable|string|max:200',
                'versi' => 'nullable|string|max:20',
                'keterangan' => 'nullable|string',
                'a_aktif' => 'nullable|boolean',
                'file' => 'nullable|file|mimes:' . implode(',', self::ALLOWED_MIMES) . '|max:' . self::MAX_SIZE_KB,
            ]);

            $newPath = $existing->path_file;
            $newMime = $existing->tipe_file;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $newPath = $this->minio->uploadTemplate($existing->kode_layanan, $file);
                $newMime = $file->getMimeType();
                // Hapus file lama (best-effort)
                try { Storage::disk(env('FILESYSTEM_DISK', 's3'))->delete($existing->path_file); } catch (\Exception $e) { /* ignore */ }
            }

            DB::connection('pgsql')->update("
                UPDATE ref.template_dokumen
                SET nm_template = COALESCE(?, nm_template),
                    versi = COALESCE(?, versi),
                    keterangan = ?,
                    path_file = ?,
                    tipe_file = ?,
                    a_aktif = COALESCE(?, a_aktif),
                    updated_at = NOW()
                WHERE id_template = ?
            ", [
                $data['nm_template'] ?? null,
                $data['versi'] ?? null,
                $data['keterangan'] ?? null,
                $newPath,
                $newMime,
                $data['a_aktif'] ?? null,
                $id,
            ]);

            return $this->successResponse(null, 'Template blanko berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.update: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Soft delete template.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $existing = DB::connection('pgsql')->selectOne(
                "SELECT id_template, path_file FROM ref.template_dokumen WHERE id_template = ? AND soft_delete = false",
                [$id]
            );
            if (!$existing) return $this->notFoundResponse();

            DB::connection('pgsql')->update(
                "UPDATE ref.template_dokumen SET soft_delete = true, a_aktif = false, updated_at = NOW() WHERE id_template = ?",
                [$id]
            );
            // Optional: delete file di MinIO
            try { Storage::disk(env('FILESYSTEM_DISK', 's3'))->delete($existing->path_file); } catch (\Exception $e) { /* ignore */ }

            return $this->successResponse(null, 'Template blanko berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Download file template.
     */
    public function download(string $id)
    {
        try {
            $row = DB::connection('pgsql')->selectOne(
                "SELECT nm_template, path_file, tipe_file FROM ref.template_dokumen
                 WHERE id_template = ? AND tipe_template = ? AND soft_delete = false",
                [$id, self::TIPE_TEMPLATE]
            );
            if (!$row) return $this->notFoundResponse('Template tidak ditemukan');

            $ext = $this->getExtensionFromMime($row->tipe_file);
            $filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $row->nm_template) . ($ext ? '.' . $ext : '');

            return $this->minio->download($row->path_file, $filename);
        } catch (\Exception $e) {
            Log::error('TemplateBlanko.download: ' . $e->getMessage());
            return $this->errorResponse('Gagal download: ' . $e->getMessage(), 500);
        }
    }

    private function getExtensionFromMime(string $mime): string
    {
        return match ($mime) {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/msword' => 'doc',
            'application/pdf' => 'pdf',
            default => '',
        };
    }
}
