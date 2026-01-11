<?php

namespace App\Services;

use App\Repositories\DosenProfileRepository;
use App\Repositories\BidangIlmuRepository;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class DosenProfileService
{
    protected $repository;
    protected $bidangIlmuRepository;

    public function __construct(DosenProfileRepository $repository, BidangIlmuRepository $bidangIlmuRepository)
    {
        $this->repository = $repository;
        $this->bidangIlmuRepository = $bidangIlmuRepository;
    }

    /**
     * Build nama lengkap with proper gelar ordering and Prof. prefix
     *
     * @param string $idSdm
     * @param string $nmSdm Base nama without gelar
     * @return string
     */
    public function buildNamaLengkap(string $idSdm, string $nmSdm): string
    {
        // Get gelar akademik
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

        // Get riwayat jabatan fungsional to check for Profesor
        $riwayatFungsional = $this->repository->getRiwayatFungsional($idSdm);

        // Check if dosen has Profesor jabatan fungsional
        $isProfesor = false;
        if (!empty($riwayatFungsional)) {
            foreach ($riwayatFungsional as $jabatan) {
                if (stripos($jabatan->jabatan, 'Profesor') !== false) {
                    $isProfesor = true;
                    break;
                }
            }
        }

        // Sort gelar depan properly: Prof. > Dr. > Ir. > other
        $sortedGelarDepan = [];

        // Check if Prof already exists in gelarDepan
        $hasProf = false;
        foreach ($gelarDepan as $gelar) {
            if (stripos($gelar, 'Prof') !== false) {
                $hasProf = true;
                break;
            }
        }

        // Add Prof. prefix if dosen is Profesor and doesn't already have Prof in gelar
        if ($isProfesor && !$hasProf) {
            $sortedGelarDepan[] = 'Prof';
        }

        // Then add Dr.
        foreach ($gelarDepan as $gelar) {
            if (stripos($gelar, 'Dr') !== false && stripos($gelar, 'Prof') === false) {
                $sortedGelarDepan[] = $gelar;
            }
        }

        // Then add Prof if it exists in gelarDepan
        foreach ($gelarDepan as $gelar) {
            if (stripos($gelar, 'Prof') !== false) {
                $sortedGelarDepan[] = $gelar;
            }
        }

        // Then add Ir.
        foreach ($gelarDepan as $gelar) {
            if (stripos($gelar, 'Ir') !== false && stripos($gelar, 'Dr') === false && stripos($gelar, 'Prof') === false) {
                $sortedGelarDepan[] = $gelar;
            }
        }

        // Then add other gelar depan (not Dr, Prof, or Ir)
        foreach ($gelarDepan as $gelar) {
            if (stripos($gelar, 'Dr') === false && stripos($gelar, 'Ir') === false && stripos($gelar, 'Prof') === false) {
                $sortedGelarDepan[] = $gelar;
            }
        }

        // Build full name with titles
        return trim(
            (count($sortedGelarDepan) > 0 ? implode('. ', $sortedGelarDepan) . '. ' : '') .
            ucwords(strtolower($nmSdm)) .
            (count($gelarBelakang) > 0 ? ', ' . implode(', ', $gelarBelakang) : '')
        );
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

        // Build full name with proper gelar ordering and Prof. prefix
        $namaLengkap = $this->buildNamaLengkap($idSdm, $profile->nm_sdm);

        // Get all related data
        $riwayatPendidikan = $this->repository->getRiwayatPendidikan($idSdm);
        $riwayatPengajaran = $this->repository->getRiwayatPengajaran($idSdm);
        $penelitianPengabdian = $this->repository->getPenelitianPengabdian($idSdm);
        $riwayatFungsional = $this->repository->getRiwayatFungsional($idSdm);
        $tugasTambahan = $this->repository->getTugasTambahan($idSdm);
        $riwayatStruktural = $this->repository->getRiwayatStruktural($idSdm);
        $riwayatKepangkatan = $this->repository->getRiwayatKepangkatan($idSdm);
        $riwayatSertifikasi = $this->repository->getRiwayatSertifikasi($idSdm);

        // Get publikasi by type
        $publikasiJurnal = $this->repository->getPublikasiJurnal($idSdm);
        $haki = $this->repository->getHaki($idSdm);
        $buku = $this->repository->getBuku($idSdm);
        $prosiding = $this->repository->getProsiding($idSdm);

        // Get bidang ilmu/keahlian
        $bidangIlmu = [];
        try {
            $bidangIlmu = $this->bidangIlmuRepository->getBidangIlmuByIdSdm($idSdm);
        } catch (\Exception $e) {
            Log::warning('Failed to fetch bidang ilmu for dosen: ' . $e->getMessage());
        }

        // Format response
        $data = [
            'id' => $encryptedId,
            'nama' => $namaLengkap, // Nama lengkap dengan gelar
            'nama_tanpa_gelar' => $profile->nm_sdm,
            'nidn' => $profile->nidn,
            'nuptk' => $profile->nuptk,
            'email' => $profile->email,
            'jenis_kelamin' => $profile->jenis_kelamin,
            'homebase' => [
                'fakultas' => $profile->homebase_fakultas,
                'jurusan' => $profile->homebase_jurusan,
                'prodi' => $profile->homebase_prodi,
                'jenjang' => $profile->homebase_jenjang,
            ],
            'bidang_ilmu' => array_map(function ($item) {
                return [
                    'id_kel_bidang' => $item->id_kel_bidang,
                    'kode_bidang' => $item->kode_bidang,
                    'nama_bidang' => $item->nama_bidang,
                    'urutan' => $item->urutan,
                ];
            }, $bidangIlmu),
            'riwayat_pendidikan' => array_map(function ($item) {
                return [
                    'jenjang' => $item->jenjang,
                    'gelar' => $item->gelar ?? null,
                    'program_studi' => $item->program_studi,
                    'bidang_studi' => $item->bidang_studi ?? null,
                    'universitas' => $item->universitas,
                    'judul_tesis' => $item->judul_tesis ?? null,
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
            'tugas_tambahan' => array_map(function ($item) {
                return [
                    'jabatan' => $item->jabatan,
                    'deskripsi' => $item->deskripsi,
                    'nama_unit' => $item->nama_unit ?? null,
                    'tmt' => $item->tmt ? date('Y-m-d', strtotime($item->tmt)) : null,
                    'no_sk' => $item->no_sk,
                    'tgl_sk' => $item->tgl_sk ? date('Y-m-d', strtotime($item->tgl_sk)) : null,
                ];
            }, $tugasTambahan),
            'riwayat_struktural' => array_map(function ($item) {
                return [
                    'jabatan' => $item->jabatan,
                    'deskripsi' => $item->deskripsi,
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
                    'id_litabmas' => $item->id_litabmas,
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
                        'id_publikasi' => $item->id_publikasi,
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
