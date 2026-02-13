<?php

namespace App\Services;

use App\Repositories\StatusKepegawaianRepository;
use Illuminate\Support\Facades\Crypt;

class StatusKepegawaianService
{
    protected StatusKepegawaianRepository $statusKepegawaianRepository;

    public function __construct(StatusKepegawaianRepository $statusKepegawaian)
    {
        $this->statusKepegawaianRepository = $statusKepegawaian;
    }

    /**
     * Get status kepegawaian data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianFakultas($idThnAjaran = null)
    {
        $raw_data = $this->statusKepegawaianRepository->getStatusKepegawaianByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'pns' => (int) $item->pns,
                'cpns' => (int) $item->cpns,
                'pppk' => (int) $item->pppk,
                'non_asn' => (int) $item->non_asn,
                'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'lainnya' => (int) $item->lainnya,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get status kepegawaian data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->statusKepegawaianRepository->getStatusKepegawaianByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'pns' => (int) $item->pns,
                'cpns' => (int) $item->cpns,
                'pppk' => (int) $item->pppk,
                'non_asn' => (int) $item->non_asn,
                'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'lainnya' => (int) $item->lainnya,
                'total' => (int) $item->total,
            ];
        })->values();

        return $prodi_data;
    }

    /**
     * Get dosen data with pagination
     *
     * @param string|null $idFakultas
     * @param string|null $idProdi
     * @param int|null $idThnAjaran
     * @param int $perPage
     * @param int $page
     * @param string|null $search
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null)
    {
        $result = $this->statusKepegawaianRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'jenis_kelamin' => $item->jenis_kelamin,
                'status_kepegawaian' => $item->status_kepegawaian,
            ];
        })->values();

        return [
            'data' => $dosen_data,
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ];
    }

    /**
     * Get tahun ajaran list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getTahunAjaranList()
    {
        return $this->statusKepegawaianRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->statusKepegawaianRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->statusKepegawaianRepository->getProdiListByFakultas($idFakultas);
    }
}
