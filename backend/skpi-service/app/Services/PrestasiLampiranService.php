<?php

namespace App\Services;

use App\Repositories\PrestasiLampiranRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrestasiLampiranService
{
    protected PrestasiLampiranRepository $repository;

    public function __construct(
        PrestasiLampiranRepository $repository
    ) {
        $this->repository = $repository;
    }

    /**
     * Upload Lampiran
     */
    public function upload(
        int $prestasiId,
        UploadedFile $file,
        string $jenis
    ) {

        $namaStorage = Str::uuid().'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs(
            'prestasi',
            $namaStorage,
            'public'
        );

        return $this->repository->create([

            'prestasi_id' => $prestasiId,

            'jenis_dokumen' => $jenis,

            'nama_file' => $file->getClientOriginalName(),

            'nama_file_storage' => $namaStorage,

            'path_file' => $path,

            'mime_type' => $file->getClientMimeType(),

            'ukuran_file' => $file->getSize()

        ]);

    }

    /**
     * List Lampiran
     */
    public function getByPrestasi(int $prestasiId)
    {
        return $this->repository->getByPrestasi($prestasiId);
    }

    /**
     * Hapus Lampiran
     */
    public function delete(int $id): bool
    {
        $lampiran = $this->repository->find($id);

        if (!$lampiran) {
            return false;
        }

        Storage::disk('public')->delete(
            $lampiran->path_file
        );

        return $this->repository->delete($id);
    }
}
