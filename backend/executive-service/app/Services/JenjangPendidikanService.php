<?php

namespace App\Services;

use App\Repositories\JenjangPendidikanRepository;
use Illuminate\Support\Facades\Crypt;

class JenjangPendidikanService
{
    protected JenjangPendidikanRepository $jenjangRepository;

    public function __construct(JenjangPendidikanRepository $jenjang)
    {
        $this->jenjangRepository = $jenjang;
    }

    /**
     * Get jenjang pendidikan data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangFakultas($idThnAjaran = null)
    {
        $raw_data = $this->jenjangRepository->getJenjangByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'd3' => (int) $item->d3,
                'd4' => (int) $item->d4,
                's1' => (int) $item->s1,
                's2' => (int) $item->s2,
                's2_terapan' => (int) $item->s2_terapan,
                's3' => (int) $item->s3,
                'profesi' => (int) $item->profesi,
                'sp1' => (int) $item->sp1,
                'sp2' => (int) $item->sp2,
                'belum_jenjang' => (int) $item->belum_jenjang,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get jenjang pendidikan data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->jenjangRepository->getJenjangByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'd3' => (int) $item->d3,
                'd4' => (int) $item->d4,
                's1' => (int) $item->s1,
                's2' => (int) $item->s2,
                's2_terapan' => (int) $item->s2_terapan,
                's3' => (int) $item->s3,
                'profesi' => (int) $item->profesi,
                'sp1' => (int) $item->sp1,
                'sp2' => (int) $item->sp2,
                'belum_jenjang' => (int) $item->belum_jenjang,
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
        $result = $this->jenjangRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'jenjang_didik' => $item->jenjang_didik,
                'status' => $item->status,
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
        return $this->jenjangRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->jenjangRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->jenjangRepository->getProdiListByFakultas($idFakultas);
    }
}
