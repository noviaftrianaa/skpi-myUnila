<?php

namespace App\Services;

use App\Repositories\PublikasiDetailRepository;
use Illuminate\Support\Facades\Crypt;

class PublikasiDetailService
{
    protected $repository;

    public function __construct(PublikasiDetailRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete publikasi detail
     */
    public function getPublikasiDetail(string $idPublikasi)
    {
        // Get basic info
        $basicInfo = $this->repository->getPublikasiBasicInfo($idPublikasi);

        if (!$basicInfo) {
            return [
                'success' => false,
                'message' => 'Publikasi not found',
                'data' => null,
            ];
        }

        // Get penulis (authors)
        $penulis = $this->repository->getPenulisPublikasi($idPublikasi);

        // Get mahasiswa penulis (if any)
        $mahasiswa = $this->repository->getMahasiswaPenulis($idPublikasi);

        // Build response
        return [
            'success' => true,
            'message' => 'Publikasi detail retrieved successfully',
            'data' => [
                'id_publikasi' => $basicInfo->id_publikasi,
                'judul' => $basicInfo->judul,
                'tahun' => $basicInfo->tahun,
                'tanggal_terbit' => $basicInfo->tanggal_terbit,
                'jenis_publikasi' => $basicInfo->jenis_publikasi,
                'penerbit' => $basicInfo->penerbit,
                'issn' => $basicInfo->issn,
                'volume' => $basicInfo->volume,
                'nomor' => $basicInfo->nomor,
                'halaman' => $basicInfo->halaman,
                'url_publikasi' => $basicInfo->url_publikasi,
                'nama_jurnal' => $basicInfo->nama_jurnal,
                'laman_jurnal' => $basicInfo->laman_jurnal,
                'doi' => $basicInfo->doi,
                'kategori_capaian' => $basicInfo->kategori_capaian,
                'litabmas' => $basicInfo->id_litabmas ? [
                    'id_litabmas' => $basicInfo->id_litabmas,
                    'judul' => $basicInfo->judul_litabmas,
                    'jenis' => $basicInfo->jenis_litabmas,
                ] : null,
                'penulis' => array_map(function ($penulis) {
                    return [
                        'id_sdm' => $penulis->id_sdm,
                        'encrypted_id' => Crypt::encryptString($penulis->id_sdm),
                        'nama' => ucwords(strtolower($penulis->nama)),
                        'nidn' => $penulis->nidn,
                        'nuptk' => $penulis->nuptk,
                        'jenis_kelamin' => $penulis->jenis_kelamin,
                        'jabatan_fungsional' => $penulis->jabatan_fungsional,
                        'prodi' => $penulis->prodi,
                        'jenjang' => $penulis->jenjang,
                        'peran' => $penulis->peran,
                    ];
                }, $penulis),
                'mahasiswa' => array_map(function ($mhs) {
                    return [
                        'id_pd' => $mhs->id_pd,
                        'encrypted_id' => Crypt::encryptString($mhs->id_pd),
                        'nama' => ucwords(strtolower($mhs->nama)),
                        'nim' => $mhs->nim,
                        'jenis_kelamin' => $mhs->jenis_kelamin,
                        'prodi' => $mhs->prodi,
                        'jenjang' => $mhs->jenjang,
                        'peran' => $mhs->peran,
                    ];
                }, $mahasiswa),
                'statistics' => [
                    'total_penulis' => count($penulis),
                    'total_mahasiswa' => count($mahasiswa),
                ],
            ],
        ];
    }
}
