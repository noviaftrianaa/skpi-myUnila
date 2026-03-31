<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Service untuk upload/download file.
 * Supports local storage (default) dan MinIO (S3-compatible).
 * Disk ditentukan oleh FILESYSTEM_DISK env var.
 *
 * Path convention:
 *   simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}
 *   simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}
 *   simbak/batch/{id_batch}/{jenis_sk}/{filename}
 *   simbak/template/{kode_layanan}/{filename}
 */
class MinioService
{
    private string $disk;

    public function __construct()
    {
        $this->disk = config('filesystems.default', 'simbak');
    }

    /**
     * Upload file.
     *
     * @return string Path file di MinIO
     */
    public function upload(string $directory, UploadedFile $file, ?string $customFilename = null): string
    {
        $filename = $customFilename ?? $this->generateFilename($file);
        $path = rtrim($directory, '/') . '/' . $filename;

        Storage::disk($this->disk)->put($path, file_get_contents($file->getRealPath()), [
            'ContentType' => $file->getMimeType(),
        ]);

        return $path;
    }

    /**
     * Upload dokumen pengajuan.
     */
    public function uploadDokumenPengajuan(string $idPengajuan, string $kodeDokumen, UploadedFile $file): string
    {
        $directory = "simbak/pengajuan/{$idPengajuan}/{$kodeDokumen}";
        return $this->upload($directory, $file);
    }

    /**
     * Upload dokumen hasil (surat/SK).
     */
    public function uploadDokumenHasil(string $idPengajuan, string $jenisOutput, UploadedFile $file): string
    {
        $directory = "simbak/hasil/{$idPengajuan}/{$jenisOutput}";
        return $this->upload($directory, $file);
    }

    /**
     * Upload SK batch.
     */
    public function uploadSkBatch(string $idBatch, string $jenisSk, UploadedFile $file): string
    {
        $directory = "simbak/batch/{$idBatch}/{$jenisSk}";
        return $this->upload($directory, $file);
    }

    /**
     * Upload template dokumen.
     */
    public function uploadTemplate(string $kodeLayanan, UploadedFile $file): string
    {
        $directory = "simbak/template/{$kodeLayanan}";
        return $this->upload($directory, $file);
    }

    /**
     * Download file dari MinIO sebagai streamed response.
     */
    public function download(string $path, ?string $downloadName = null): StreamedResponse
    {
        $disk = Storage::disk($this->disk);

        if (!$disk->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        $filename = $downloadName ?? basename($path);
        $mimeType = $disk->mimeType($path) ?: 'application/octet-stream';

        return response()->streamDownload(function () use ($disk, $path) {
            echo $disk->get($path);
        }, $filename, [
            'Content-Type' => $mimeType,
        ]);
    }

    /**
     * Get temporary/presigned URL (berlaku 60 menit default).
     */
    public function getTemporaryUrl(string $path, int $minutes = 60): string
    {
        return Storage::disk($this->disk)->temporaryUrl($path, now()->addMinutes($minutes));
    }

    /**
     * Delete file dari MinIO.
     */
    public function delete(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }

    /**
     * Check apakah file exists.
     */
    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    /**
     * Get file size in bytes.
     */
    public function size(string $path): int
    {
        return Storage::disk($this->disk)->size($path);
    }

    /**
     * Generate unique filename.
     */
    private function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('Ymd_His');
        $random = Str::random(8);
        return "{$timestamp}_{$random}.{$extension}";
    }
}
