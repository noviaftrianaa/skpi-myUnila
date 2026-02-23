<?php

namespace App\Services;

use App\Repositories\RasioRepository;
use Illuminate\Support\Facades\Crypt;

class RasioService
{
    protected RasioRepository $rasioRepository;

    public function __construct(RasioRepository $rasio)
    {
        $this->rasioRepository = $rasio;
    }

    public function getRasioFakultas($idSmt = null, $fakultasId = null)
    {
        $raw_data = $this->rasioRepository->getRasioFakultas($idSmt);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            // Calculate rasio string format (1:XX)
            $rasio = $item['jumlah_dosen'] > 0
                ? '1:' . round($item['jumlah_mahasiswa'] / $item['jumlah_dosen'])
                : '1:0';

            return [
                'id' => $item['id'],
                'nama_fakultas' => $item['nama_fakultas'],
                'total_dosen' => (int) $item['jumlah_dosen'],
                'total_mahasiswa' => (int) $item['jumlah_mahasiswa'],
                'rasio' => $rasio,
            ];
        })->values();

        // Filter by fakultas ID if provided
        if ($fakultasId) {
            $fakultas_data = $fakultas_data->filter(function ($item) use ($fakultasId) {
                return $item['id'] == $fakultasId;
            })->values();
        }

        return $fakultas_data;
    }

    public function getRasioProdi($idFakultas, $idSmt = null)
    {
        $raw_data = $this->rasioRepository->getRasioProdi($idFakultas, $idSmt);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            // Calculate rasio string format (1:XX)
            $rasio = $item['jumlah_dosen'] > 0
                ? '1:' . round($item['jumlah_mahasiswa'] / $item['jumlah_dosen'])
                : '1:0';

            return [
                'id' => $item['id'],
                'nama_prodi' => $item['nama_prodi'],
                'fakultas_id' => $item['fakultas_id'],
                'jumlah_dosen' => (int) $item['jumlah_dosen'],
                'jumlah_mahasiswa' => (int) $item['jumlah_mahasiswa'],
                'rasio' => $rasio,
            ];
        })->values();

        return $prodi_data;
    }

    public function getDataMahasiswa($idFakultas = null, $idSmt = null, $perPage = 10, $page = 1, $search = null, $idProdi = null)
    {
        $result = $this->rasioRepository->getDataMahasiswa($idFakultas, $idSmt, $perPage, $page, $search, $idProdi);

        // Transform to match frontend Mahasiswa interface
        $mahasiswa_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                "encrypted_id" => Crypt::encryptString($item->id),
                'nim' => $item->nim,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'angkatan' => $item->angkatan,
            ];
        })->values();

        return [
            'data' => $mahasiswa_data,
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ];
    }

    public function getDataDosen($idFakultas = null, $idSmt = null, $perPage = 10, $page = 1, $search = null, $idProdi = null)
    {
        $result = $this->rasioRepository->getDataDosen($idFakultas, $idSmt, $perPage, $page, $search, $idProdi);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                "encrypted_id" => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
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

    public function getFakultasList()
    {
        return $this->rasioRepository->getFakultasList();
    }

    public function getTahunAjaranList()
    {
        return $this->rasioRepository->getTahunAjaranList();
    }
}
