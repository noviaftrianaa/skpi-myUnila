<?php

namespace App\Services;

use App\Repositories\JabFungRepository;
use Illuminate\Support\Facades\Crypt;

class JabFungService
{
    protected JabFungRepository $jabfungRepository;

    public function __construct(JabFungRepository $jabfung)
    {
        $this->jabfungRepository = $jabfung;
    }

    /**
     * Get jabfung data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungFakultas($idThnAjaran = null)
    {
        $raw_data = $this->jabfungRepository->getJabfungByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'belum_jabfung' => (int) $item->belum_jabfung,
                'asisten_ahli' => (int) $item->asisten_ahli,
                'lektor' => (int) $item->lektor,
                'lektor_kepala' => (int) $item->lektor_kepala,
                'profesor' => (int) $item->profesor,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get jabfung data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->jabfungRepository->getJabfungByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'belum_jabfung' => (int) $item->belum_jabfung,
                'asisten_ahli' => (int) $item->asisten_ahli,
                'lektor' => (int) $item->lektor,
                'lektor_kepala' => (int) $item->lektor_kepala,
                'profesor' => (int) $item->profesor,
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
        $result = $this->jabfungRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'jabfung' => $item->jabfung,
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
        return $this->jabfungRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->jabfungRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->jabfungRepository->getProdiListByFakultas($idFakultas);
    }
}
