<?php

namespace App\Services;

use App\Repositories\MahasiswaProfileRepository;

class MahasiswaProfileService
{
    protected $repository;

    public function __construct(MahasiswaProfileRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete mahasiswa profile
     */
    public function getCompleteProfile(string $idPd)
    {
        // Get basic info
        $basicInfo = $this->repository->getBasicInfo($idPd);

        if (!$basicInfo) {
            return [
                'success' => false,
                'message' => 'Mahasiswa not found',
                'data' => null,
            ];
        }

        // Get homebase info (registration and prodi)
        $homebaseList = $this->repository->getHomebaseInfo($idPd);

        if (empty($homebaseList)) {
            return [
                'success' => false,
                'message' => 'Mahasiswa registration not found',
                'data' => null,
            ];
        }

        // Use the first (most recent) registration as primary homebase
        $homebase = $homebaseList[0];

        // Get status semester
        $statusSemester = $this->repository->getStatusSemester($homebase->id_reg_pd);

        // Get mata kuliah yang sudah diambil
        $mataKuliah = $this->repository->getMataKuliah($homebase->id_reg_pd);

        // Group mata kuliah by semester
        $mataKuliahBySemester = [];
        foreach ($mataKuliah as $mk) {
            $semesterKey = $mk->id_smt;
            if (!isset($mataKuliahBySemester[$semesterKey])) {
                $mataKuliahBySemester[$semesterKey] = [
                    'semester' => $mk->semester,
                    'mata_kuliah' => [],
                ];
            }

            $mataKuliahBySemester[$semesterKey]['mata_kuliah'][] = [
                'kode_mk' => $mk->kode_mk,
                'nama_mk' => $mk->nama_mk,
                'sks' => (int) $mk->sks,
            ];
        }

        // Build response
        return [
            'success' => true,
            'message' => 'Mahasiswa profile retrieved successfully',
            'data' => [
                'nama' => ucwords(strtolower($basicInfo->nama)),
                'nim' => $homebase->nim,
                'jenis_kelamin' => $basicInfo->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                'status' => $homebase->status,
                'homebase' => [
                    'id_sms' => $homebase->id_sms ?? null,
                    'prodi' => $homebase->nama_prodi,
                    'fakultas' => $homebase->nama_fakultas ?? null,
                    'jurusan' => $homebase->nama_jurusan ?? null,
                    'jenjang' => $homebase->jenjang,
                    'semester_masuk' => $homebase->semester_masuk,
                    'tanggal_masuk' => $homebase->tgl_masuk_sp,
                ],
                'status_semester' => array_map(function ($status) {
                    return [
                        'id_smt' => $status->id_smt,
                        'semester' => $status->semester,
                        'status' => $status->status ?? 'Tidak Diketahui',
                        'sks_diambil' => $status->sks_diambil ? (int) $status->sks_diambil : 0,
                        'total_sks' => $status->total_sks ? (int) $status->total_sks : 0,
                    ];
                }, $statusSemester),
                'mata_kuliah' => array_values($mataKuliahBySemester),
                'statistics' => [
                    'total_semester' => count($statusSemester),
                    'total_mata_kuliah' => count($mataKuliah),
                ],
            ],
        ];
    }
}
