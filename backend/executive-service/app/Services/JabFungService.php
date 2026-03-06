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
     * @param string|null $fakultasId
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungFakultas($idThnAjaran = null, $fakultasId = null)
    {
        $raw_data = $this->jabfungRepository->getJabfungByLevel($idThnAjaran, $fakultasId);

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
     * @param string|null $jabfung
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null, $jabfung = null)
    {
        $result = $this->jabfungRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $jabfung);

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
     * @param string|null $fakultasId
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList($fakultasId = null)
    {
        return $this->jabfungRepository->getFakultasList($fakultasId);
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

    /**
     * Get historical jabfung data at university/fakultas level for multiple years
     *
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungFakultasHistorical($selectedYearId, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jabfungRepository->getJabfungFakultasHistorical($startYear, $selectedYear, $fakultasId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
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

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => $yearData['tahun_id'],
                'smt_id' => $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }

    /**
     * Get historical jabfung data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jabfungRepository->getJabfungProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
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

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => $yearData['tahun_id'],
                'smt_id' => $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }
}
