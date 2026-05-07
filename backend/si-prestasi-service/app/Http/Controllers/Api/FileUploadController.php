<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * FileUploadController — upload bukti (sertifikat, foto UPP, undangan, surat tugas).
 * File disimpan di FILESYSTEM_DISK (default local volume, optional MinIO).
 *
 * Karena URL file dikirim ke SIMKATMAWA (harus public-accessible), Nginx harus
 * expose path storage ke route /files/{path}. Untuk disk local, nginx serve
 * langsung dari volume mount. Untuk MinIO, bucket harus public-read.
 */
class FileUploadController extends Controller
{
    use ApiResponse;

    private const MAX_SIZE_KB = 10240; // 10 MB
    private const ALLOWED_MIME = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];
    private const ALLOWED_JENIS = [
        'peserta', 'sertifikat', 'foto_upp', 'undangan', 'surat_tugas',
    ];
    private const ALLOWED_PARENT = [
        'prestasi-mandiri', 'sertifikasi', 'rekognisi', 'surat-tugas',
    ];

    /**
     * POST /api/v1/files/upload
     * multipart: file (required), parent_tipe (prestasi-mandiri|sertifikasi|rekognisi|surat-tugas),
     *            id_parent (uuid, optional — kalau belum ada record), jenis (peserta|sertifikat|foto_upp|undangan|surat_tugas)
     */
    public function upload(Request $request): JsonResponse
    {
        $v = $request->validate([
            'file' => 'required|file|max:' . self::MAX_SIZE_KB,
            'parent_tipe' => 'required|in:' . implode(',', self::ALLOWED_PARENT),
            'id_parent' => 'nullable|uuid',
            'jenis' => 'required|in:' . implode(',', self::ALLOWED_JENIS),
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        if (!in_array($mime, self::ALLOWED_MIME, true)) {
            return $this->errorResponse(
                'Tipe file tidak diizinkan. Diperbolehkan: PDF, JPG, PNG',
                422,
                ['mime' => $mime]
            );
        }

        // SECURITY: Validasi magic number (file signature) — JANGAN cuma andalkan
        // Content-Type header / extension karena attacker bisa rename .php ke .pdf
        // dan kirim Content-Type: application/pdf. Magic number cek byte awal file.
        if (!$this->validateFileSignature($file->getRealPath(), $mime)) {
            return $this->errorResponse(
                'File tidak valid (signature tidak match dengan tipe yang dideklarasikan)',
                422,
                ['mime' => $mime]
            );
        }

        // UUID filename untuk mencegah guessing + preserve extension asli
        $ext = $file->getClientOriginalExtension() ?: $this->extFromMime($mime);
        $uuid = (string) Str::uuid();
        $filename = "{$uuid}.{$ext}";

        $idParent = $v['id_parent'] ?? 'unassigned';
        $relativePath = "{$v['parent_tipe']}/{$idParent}/{$v['jenis']}/{$filename}";

        Storage::put($relativePath, file_get_contents($file->getRealPath()), 'public');

        $url = $this->buildPublicUrl($relativePath);

        return $this->successResponse([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $mime,
            'size' => $file->getSize(),
            'path' => $relativePath,
            'url' => $url,
            'jenis' => $v['jenis'],
            'parent_tipe' => $v['parent_tipe'],
            'id_parent' => $idParent,
        ], 'File berhasil diupload', 201);
    }

    /**
     * DELETE /api/v1/files
     * body: path — hapus file dari storage. Hanya untuk admin (validasi di middleware).
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate(['path' => 'required|string|max:500']);
        $path = $request->input('path');

        // Safety: path tidak boleh traverse
        if (str_contains($path, '..')) {
            return $this->errorResponse('Path tidak valid', 422);
        }

        if (!Storage::exists($path)) {
            return $this->notFoundResponse('File tidak ditemukan');
        }

        Storage::delete($path);
        return $this->successResponse(null, 'File dihapus');
    }

    private function buildPublicUrl(string $relativePath): string
    {
        $disk = config('filesystems.default');

        if ($disk === 'minio') {
            // MinIO S3 — use Storage::url()
            return Storage::url($relativePath);
        }

        // Local disk — URL akan di-serve via nginx /files/ path
        $baseUrl = config('filesystems.disks.siprestasi.url', env('APP_URL') . '/files');
        return rtrim($baseUrl, '/') . '/' . ltrim($relativePath, '/');
    }

    private function extFromMime(string $mime): string
    {
        return match ($mime) {
            'application/pdf' => 'pdf',
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            default => 'bin',
        };
    }

    /**
     * Validasi magic number (file signature) — pastikan byte awal file sesuai
     * dengan MIME type yang dideklarasikan. Cegah serangan polyglot / MIME
     * spoofing (mis. .php disamarkan sbg .pdf).
     *
     * Reference signatures:
     *   PDF  : 25 50 44 46 ("%PDF")
     *   JPEG : FF D8 FF
     *   PNG  : 89 50 4E 47 0D 0A 1A 0A
     */
    private function validateFileSignature(string $path, string $declaredMime): bool
    {
        $handle = @fopen($path, 'rb');
        if (!$handle) {
            return false;
        }
        $header = fread($handle, 8);
        fclose($handle);

        if ($header === false || strlen($header) < 4) {
            return false;
        }

        return match ($declaredMime) {
            'application/pdf' => substr($header, 0, 4) === '%PDF',
            'image/jpeg', 'image/jpg' => substr($header, 0, 3) === "\xFF\xD8\xFF",
            'image/png' => substr($header, 0, 8) === "\x89PNG\r\n\x1A\n",
            default => false,
        };
    }
}
