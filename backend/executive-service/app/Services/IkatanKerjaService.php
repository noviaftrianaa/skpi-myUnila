<?php

namespace App\Services;

use App\Repositories\IkatanKerjaRepository;
use Illuminate\Support\Facades\Crypt;

class IkatanKerjaService
{
    protected IkatanKerjaRepository $ikatanKerjaRepository;

    public function __construct(IkatanKerjaRepository $ikatanKerja)
    {
        $this->ikatanKerjaRepository = $ikatanKerja;
    }

    public function getIkatanKerjaFakultas($idThnAjaran = null)
    {
        $rawData = $this->ikatanKerjaRepository->getIkatanKerjaByLevel($idThnAjaran);

        return collect($rawData)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'dosen_tetap' => (int) $item->dosen_tetap,
                'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                'p3k_asn' => (int) $item->p3k_asn,
                'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                'instruktur' => (int) $item->instruktur,
                'tutor' => (int) $item->tutor,
                'jft' => (int) $item->jft,
                'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
                'total' => (int) $item->total,
            ];
        })->values();
    }

    public function getIkatanKerjaProdi($idFakultas, $idThnAjaran = null)
    {
        $rawData = $this->ikatanKerjaRepository->getIkatanKerjaByLevel($idThnAjaran, $idFakultas);

        return collect($rawData)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'dosen_tetap' => (int) $item->dosen_tetap,
                'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                'p3k_asn' => (int) $item->p3k_asn,
                'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                'instruktur' => (int) $item->instruktur,
                'tutor' => (int) $item->tutor,
                'jft' => (int) $item->jft,
                'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
                'total' => (int) $item->total,
            ];
        })->values();
    }

    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null)
    {
        $result = $this->ikatanKerjaRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

        $dosenData = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'ikatan_kerja' => $item->ikatan_kerja,
                'status' => $item->status,
            ];
        })->values();

        return [
            'data' => $dosenData,
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ];
    }

    public function getTahunAjaranList()
    {
        return $this->ikatanKerjaRepository->getTahunAjaranList();
    }

    public function getFakultasList()
    {
        return $this->ikatanKerjaRepository->getFakultasList();
    }

    public function getProdiListByFakultas($idFakultas)
    {
        return $this->ikatanKerjaRepository->getProdiListByFakultas($idFakultas);
    }
}
