<?php

namespace App\Services;

use App\Repositories\PangGolRepository;
use Illuminate\Support\Facades\Crypt;

class PangGolService
{
    protected PangGolRepository $panggolRepository;

    public function __construct(PangGolRepository $panggol)
    {
        $this->panggolRepository = $panggol;
    }

    /**
     * Get pangkat golongan data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatGolonganFakultas($idThnAjaran = null)
    {
        $raw_data = $this->panggolRepository->getPangkatGolonganByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'juru_muda' => (int) $item->juru_muda,
                'juru_muda_tk_1' => (int) $item->juru_muda_tk_1,
                'juru' => (int) $item->juru,
                'juru_tk_1' => (int) $item->juru_tk_1,
                'pengatur_muda' => (int) $item->pengatur_muda,
                'pengatur_muda_tk_1' => (int) $item->pengatur_muda_tk_1,
                'pengatur' => (int) $item->pengatur,
                'pengatur_tk_1' => (int) $item->pengatur_tk_1,
                'penata_muda' => (int) $item->penata_muda,
                'penata_muda_tk_1' => (int) $item->penata_muda_tk_1,
                'penata' => (int) $item->penata,
                'penata_tk_1' => (int) $item->penata_tk_1,
                'pembina' => (int) $item->pembina,
                'pembina_tk_1' => (int) $item->pembina_tk_1,
                'pembina_utama_muda' => (int) $item->pembina_utama_muda,
                'pembina_utama_madya' => (int) $item->pembina_utama_madya,
                'pembina_utama' => (int) $item->pembina_utama,
                'belum_pangkat_gol' => (int) $item->belum_pangkat_gol,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get pangkat golongan data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatGolonganProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->panggolRepository->getPangkatGolonganByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'juru_muda' => (int) $item->juru_muda,
                'juru_muda_tk_1' => (int) $item->juru_muda_tk_1,
                'juru' => (int) $item->juru,
                'juru_tk_1' => (int) $item->juru_tk_1,
                'pengatur_muda' => (int) $item->pengatur_muda,
                'pengatur_muda_tk_1' => (int) $item->pengatur_muda_tk_1,
                'pengatur' => (int) $item->pengatur,
                'pengatur_tk_1' => (int) $item->pengatur_tk_1,
                'penata_muda' => (int) $item->penata_muda,
                'penata_muda_tk_1' => (int) $item->penata_muda_tk_1,
                'penata' => (int) $item->penata,
                'penata_tk_1' => (int) $item->penata_tk_1,
                'pembina' => (int) $item->pembina,
                'pembina_tk_1' => (int) $item->pembina_tk_1,
                'pembina_utama_muda' => (int) $item->pembina_utama_muda,
                'pembina_utama_madya' => (int) $item->pembina_utama_madya,
                'pembina_utama' => (int) $item->pembina_utama,
                'belum_pangkat_gol' => (int) $item->belum_pangkat_gol,
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
     * @param string|null $pangkatGolongan
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null, $pangkatGolongan = null)
    {
        $result = $this->panggolRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $pangkatGolongan);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'pangkat_golongan' => $item->pangkat_golongan,
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
        return $this->panggolRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->panggolRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->panggolRepository->getProdiListByFakultas($idFakultas);
    }

    /**
     * Get pangkat golongan historical data at university/fakultas level
     *
     * @param int $selectedYearId
     * @param int|null $yearsBack
     * @param string|null $fakultasId
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatGolonganFakultasHistorical($selectedYearId, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->panggolRepository->getPangkatGolonganFakultasHistorical($startYear, $selectedYear);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'juru_muda' => (int) $item->juru_muda,
                    'juru_muda_tk_1' => (int) $item->juru_muda_tk_1,
                    'juru' => (int) $item->juru,
                    'juru_tk_1' => (int) $item->juru_tk_1,
                    'pengatur_muda' => (int) $item->pengatur_muda,
                    'pengatur_muda_tk_1' => (int) $item->pengatur_muda_tk_1,
                    'pengatur' => (int) $item->pengatur,
                    'pengatur_tk_1' => (int) $item->pengatur_tk_1,
                    'penata_muda' => (int) $item->penata_muda,
                    'penata_muda_tk_1' => (int) $item->penata_muda_tk_1,
                    'penata' => (int) $item->penata,
                    'penata_tk_1' => (int) $item->penata_tk_1,
                    'pembina' => (int) $item->pembina,
                    'pembina_tk_1' => (int) $item->pembina_tk_1,
                    'pembina_utama_muda' => (int) $item->pembina_utama_muda,
                    'pembina_utama_madya' => (int) $item->pembina_utama_madya,
                    'pembina_utama' => (int) $item->pembina_utama,
                    'belum_pangkat_gol' => (int) $item->belum_pangkat_gol,
                    'total' => (int) $item->total,
                ];
            })->values();

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => (string) $yearData['tahun_id'],
                'smt_id' => (string) $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }

    /**
     * Get pangkat golongan historical data at fakultas/prodi level
     *
     * @param string $fakultasId
     * @param int $selectedYearId
     * @param int|null $yearsBack
     * @param string|null $prodiId
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatGolonganProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->panggolRepository->getPangkatGolonganProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_prodi' => $item->nama_prodi,
                    'fakultas_id' => $item->fakultas_id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'juru_muda' => (int) $item->juru_muda,
                    'juru_muda_tk_1' => (int) $item->juru_muda_tk_1,
                    'juru' => (int) $item->juru,
                    'juru_tk_1' => (int) $item->juru_tk_1,
                    'pengatur_muda' => (int) $item->pengatur_muda,
                    'pengatur_muda_tk_1' => (int) $item->pengatur_muda_tk_1,
                    'pengatur' => (int) $item->pengatur,
                    'pengatur_tk_1' => (int) $item->pengatur_tk_1,
                    'penata_muda' => (int) $item->penata_muda,
                    'penata_muda_tk_1' => (int) $item->penata_muda_tk_1,
                    'penata' => (int) $item->penata,
                    'penata_tk_1' => (int) $item->penata_tk_1,
                    'pembina' => (int) $item->pembina,
                    'pembina_tk_1' => (int) $item->pembina_tk_1,
                    'pembina_utama_muda' => (int) $item->pembina_utama_muda,
                    'pembina_utama_madya' => (int) $item->pembina_utama_madya,
                    'pembina_utama' => (int) $item->pembina_utama,
                    'belum_pangkat_gol' => (int) $item->belum_pangkat_gol,
                    'total' => (int) $item->total,
                ];
            })->values();

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => (string) $yearData['tahun_id'],
                'smt_id' => (string) $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }
}
