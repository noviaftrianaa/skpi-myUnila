<?php

namespace App\Services;

use App\Repositories\PenelitianDetailRepository;

class PenelitianDetailService
{
    protected $repository;

    public function __construct(PenelitianDetailRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete penelitian detail
     */
    public function getPenelitianDetail(string $idLitabmas)
    {
        // Get basic info
        $basicInfo = $this->repository->getPenelitianBasicInfo($idLitabmas);

        if (!$basicInfo) {
            return [
                'success' => false,
                'message' => 'Penelitian not found',
                'data' => null,
            ];
        }

        // Get anggota tim
        $anggota = $this->repository->getAnggotaPenelitian($idLitabmas);

        // Get publikasi
        $publikasi = $this->repository->getPublikasiPenelitian($idLitabmas);

        // Get luaran lainnya
        $luaranLainnya = $this->repository->getLuaranLainnya($idLitabmas);

        // Get mahasiswa
        $mahasiswa = $this->repository->getMahasiswaPenelitian($idLitabmas);

        // Format biaya
        $biaya = $basicInfo->biaya ? (float) $basicInfo->biaya : 0;

        // Build response
        return [
            'success' => true,
            'message' => 'Penelitian detail retrieved successfully',
            'data' => [
                'id_litabmas' => $basicInfo->id_litabmas,
                'judul' => $basicInfo->judul_litabmas,
                'tahun' => $basicInfo->tahun,
                'tanggal_mulai' => $basicInfo->tanggal_mulai,
                'tanggal_selesai' => $basicInfo->tanggal_selesai,
                'lama_kegiatan' => $basicInfo->lama_kegiatan ? (int) $basicInfo->lama_kegiatan : 0,
                'biaya' => $biaya,
                'dana_dikti' => $basicInfo->dana_dikti ? (float) $basicInfo->dana_dikti : 0,
                'dana_pt' => $basicInfo->dana_pt ? (float) $basicInfo->dana_pt : 0,
                'dana_institusi_lain' => $basicInfo->dana_institusi_lain ? (float) $basicInfo->dana_institusi_lain : 0,
                'skim' => $basicInfo->skim,
                'lokasi_kegiatan' => $basicInfo->lokasi_kegiatan,
                'bidang_ilmu' => $basicInfo->bidang_ilmu,
                'sumber_dana' => $basicInfo->sumber_dana,
                'abstrak' => $basicInfo->abstrak,
                'kata_kunci' => $basicInfo->kata_kunci,
                'url_penelitian' => $basicInfo->url_penelitian,
                'anggota_tim' => array_map(function ($anggota) {
                    return [
                        'id_sdm' => $anggota->id_sdm,
                        'nama' => ucwords(strtolower($anggota->nama)),
                        'nidn' => $anggota->nidn,
                        'nuptk' => $anggota->nuptk,
                        'jenis_kelamin' => $anggota->jenis_kelamin,
                        'jabatan_fungsional' => $anggota->jabatan_fungsional,
                        'prodi' => $anggota->prodi,
                        'jenjang' => $anggota->jenjang,
                        'peran' => $anggota->peran,
                    ];
                }, $anggota),
                'publikasi' => array_map(function ($pub) {
                    return [
                        'id_publikasi' => $pub->id_publikasi,
                        'judul' => $pub->judul,
                        'tahun' => $pub->tahun,
                        'tanggal_terbit' => $pub->tgl_terbit,
                        'jenis_publikasi' => $pub->jenis_publikasi,
                        'penerbit' => $pub->penerbit,
                        'issn' => $pub->issn,
                        'volume' => $pub->volume,
                        'nomor' => $pub->nomor,
                        'halaman' => $pub->halaman,
                        'url_publikasi' => $pub->url_publikasi,
                    ];
                }, $publikasi),
                'luaran_lainnya' => array_map(function ($luaran) {
                    return [
                        'id_luaran_lainnya' => $luaran->id_luaran_lainnya,
                        'judul' => $luaran->judul,
                        'tahun' => $luaran->tahun,
                        'jenis_luaran' => $luaran->jenis_luaran,
                        'keterangan' => $luaran->keterangan,
                        'tautan' => $luaran->tautan,
                    ];
                }, $luaranLainnya),
                'mahasiswa' => array_map(function ($mhs) {
                    return [
                        'id_pd' => $mhs->id_pd,
                        'nama' => ucwords(strtolower($mhs->nama)),
                        'nim' => $mhs->nim,
                        'jenis_kelamin' => $mhs->jenis_kelamin,
                        'prodi' => $mhs->prodi,
                        'jenjang' => $mhs->jenjang,
                        'peran' => $mhs->peran,
                    ];
                }, $mahasiswa),
                'statistics' => [
                    'total_anggota_tim' => count($anggota),
                    'total_publikasi' => count($publikasi),
                    'total_luaran_lainnya' => count($luaranLainnya),
                    'total_mahasiswa' => count($mahasiswa),
                ],
            ],
        ];
    }
}
