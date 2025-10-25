<?php

namespace App\Services;

use App\Repositories\DosenProfileRepository;
use Illuminate\Support\Facades\Crypt;

class DosenProfileService
{
    protected $repository;

    public function __construct(DosenProfileRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete dosen profile with all related data
     */
    public function getCompleteProfile(string $encryptedId)
    {
        try {
            // Decrypt ID
            $idSdm = Crypt::decryptString($encryptedId);
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Invalid dosen ID',
                'data' => null
            ];
        }

        // Get basic profile
        $profile = $this->repository->getDosenProfile($idSdm);

        if (!$profile) {
            return [
                'success' => false,
                'message' => 'Dosen not found',
                'data' => null
            ];
        }

        // Get gelar akademik and build full name
        $gelarList = $this->repository->getGelarAkademik($idSdm);
        $gelarDepan = [];
        $gelarBelakang = [];

        foreach ($gelarList as $gelar) {
            if ($gelar->posisi_gelar == 1) {
                $gelarDepan[] = $gelar->singkat_gelar;
            } elseif ($gelar->posisi_gelar == 2) {
                $gelarBelakang[] = $gelar->singkat_gelar;
            }
        }

        // Build full name with titles
        $namaLengkap = trim(
            (count($gelarDepan) > 0 ? implode('. ', $gelarDepan) . '. ' : '') .
            $profile->nm_sdm .
            (count($gelarBelakang) > 0 ? ', ' . implode(', ', $gelarBelakang) : '')
        );

        // Get all related data
        $riwayatPendidikan = $this->repository->getRiwayatPendidikan($idSdm);
        $riwayatPengajaran = $this->repository->getRiwayatPengajaran($idSdm);
        $penelitianPengabdian = $this->repository->getPenelitianPengabdian($idSdm);

        // Get riwayat jabatan dan kepangkatan
        $riwayatFungsional = $this->repository->getRiwayatFungsional($idSdm);
        $riwayatStruktural = $this->repository->getRiwayatStruktural($idSdm);
        $riwayatKepangkatan = $this->repository->getRiwayatKepangkatan($idSdm);
        $riwayatSertifikasi = $this->repository->getRiwayatSertifikasi($idSdm);

        // Get publikasi by type
        $publikasiJurnal = $this->repository->getPublikasiJurnal($idSdm);
        $haki = $this->repository->getHaki($idSdm);
        $buku = $this->repository->getBuku($idSdm);
        $prosiding = $this->repository->getProsiding($idSdm);

        // Format response
        $data = [
            'id' => $encryptedId,
            'id_sdm' => $profile->id_sdm,
            'nama' => $namaLengkap, // Nama lengkap dengan gelar
            'nama_tanpa_gelar' => $profile->nm_sdm,
            'nidn' => $profile->nidn,
            'nip' => $profile->nip,
            'email' => $profile->email,
            'jenis_kelamin' => $profile->jenis_kelamin,
            'homebase' => [
                'fakultas' => $profile->homebase_fakultas,
                'jurusan' => $profile->homebase_jurusan,
                'prodi' => $profile->homebase_prodi,
                'jenjang' => $profile->homebase_jenjang,
            ],
            'riwayat_pendidikan' => array_map(function ($item) {
                return [
                    'jenjang' => $item->jenjang,
                    'program_studi' => $item->program_studi,
                    'universitas' => $item->universitas,
                    'tahun_lulus' => $item->tahun_lulus,
                ];
            }, $riwayatPendidikan),
            'riwayat_fungsional' => array_map(function ($item) {
                return [
                    'jabatan' => $item->jabatan,
                    'tmt' => $item->tmt ? date('Y-m-d', strtotime($item->tmt)) : null,
                    'no_sk' => $item->no_sk,
                    'tgl_sk' => $item->tgl_sk ? date('Y-m-d', strtotime($item->tgl_sk)) : null,
                ];
            }, $riwayatFungsional),
            'riwayat_struktural' => array_map(function ($item) {
                return [
                    'jabatan' => $item->jabatan,
                    'tmt' => $item->tmt ? date('Y-m-d', strtotime($item->tmt)) : null,
                    'no_sk' => $item->no_sk,
                    'tgl_sk' => $item->tgl_sk ? date('Y-m-d', strtotime($item->tgl_sk)) : null,
                ];
            }, $riwayatStruktural),
            'riwayat_kepangkatan' => array_map(function ($item) {
                return [
                    'pangkat' => $item->pangkat,
                    'tmt' => $item->tmt ? date('Y-m-d', strtotime($item->tmt)) : null,
                    'no_sk' => $item->no_sk,
                    'tgl_sk' => $item->tgl_sk ? date('Y-m-d', strtotime($item->tgl_sk)) : null,
                ];
            }, $riwayatKepangkatan),
            'riwayat_sertifikasi' => array_map(function ($item) {
                return [
                    'jenjang_sertifikasi' => $item->jenjang_sertifikasi,
                    'bidang_studi' => $item->bidang_studi,
                    'no_sertifikat' => $item->no_sertifikat,
                    'no_registrasi' => $item->no_registrasi,
                    'tahun' => $item->tahun,
                ];
            }, $riwayatSertifikasi),
            'riwayat_pengajaran' => array_map(function ($item) {
                return [
                    'tahun_ajaran' => $item->tahun_ajaran,
                    'mata_kuliah' => $item->mata_kuliah,
                    'program_studi' => $item->program_studi,
                    'sks' => $item->sks,
                ];
            }, $riwayatPengajaran),
            'penelitian_pengabdian' => array_map(function ($item) {
                return [
                    'tahun' => $item->tahun,
                    'judul' => $item->judul,
                    'jenis' => $item->jenis,
                    'skema' => $item->skema,
                    'status' => $item->status,
                ];
            }, $penelitianPengabdian),
            'publikasi' => [
                'jurnal' => array_map(function ($item) {
                    return [
                        'tahun' => $item->tahun,
                        'judul' => $item->judul,
                        'nama_jurnal' => $item->nama_jurnal,
                        'issn' => $item->issn,
                        'quartile' => $item->quartile,
                        'jenis_jurnal' => $item->jenis_jurnal ?? null,
                    ];
                }, $publikasiJurnal),
                'haki' => array_map(function ($item) {
                    return [
                        'tahun' => $item->tahun,
                        'judul' => $item->judul,
                        'jenis' => $item->jenis,
                        'nomor_pendaftaran' => $item->nomor_pendaftaran,
                    ];
                }, $haki),
                'prosiding' => array_map(function ($item) {
                    return [
                        'tahun' => $item->tahun,
                        'judul' => $item->judul,
                        'nama_seminar' => $item->nama_seminar,
                        'jenis_prosiding' => $item->jenis_prosiding ?? null,
                    ];
                }, $prosiding),
                'buku' => array_map(function ($item) {
                    return [
                        'tahun' => $item->tahun,
                        'judul' => $item->judul,
                        'penerbit' => $item->penerbit,
                        'isbn' => $item->isbn,
                        'jenis_buku' => $item->jenis_buku ?? null,
                    ];
                }, $buku),
            ],
            'statistics' => [
                'total_penelitian' => count(array_filter($penelitianPengabdian, fn($item) => $item->jenis === 'Penelitian')),
                'total_pengabdian' => count(array_filter($penelitianPengabdian, fn($item) => $item->jenis === 'Pengabdian')),
                'total_publikasi' => count($publikasiJurnal) + count($haki) + count($prosiding) + count($buku),
                'total_mata_kuliah' => count($riwayatPengajaran),
            ]
        ];

        return [
            'success' => true,
            'message' => 'Dosen profile retrieved successfully',
            'data' => $data
        ];
    }
}
