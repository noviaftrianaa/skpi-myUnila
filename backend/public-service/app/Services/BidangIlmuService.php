<?php

namespace App\Services;

use App\Repositories\BidangIlmuRepository;
use Illuminate\Support\Facades\Crypt;

class BidangIlmuService
{
    protected $repository;

    public function __construct(BidangIlmuRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get bidang ilmu for a dosen by encrypted ID
     * Accepts encrypted ID and decrypts it to get the actual id_sdm
     */
    public function getBidangIlmuByEncryptedId(string $encryptedId)
    {
        try {
            // Decrypt the encrypted ID to get actual id_sdm
            $idSdm = Crypt::decryptString($encryptedId);

            $bidangIlmu = $this->repository->getBidangIlmuByIdSdm($idSdm);

            return [
                'success' => true,
                'message' => 'Bidang ilmu retrieved successfully',
                'data' => $bidangIlmu
            ];
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            return [
                'success' => false,
                'message' => 'Invalid dosen ID',
                'error' => 'Decryption failed',
                'data' => []
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve bidang ilmu',
                'error' => $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Search bidang ilmu with pagination
     */
    public function searchBidangIlmu(string $search = '', int $page = 1, int $limit = 20)
    {
        $offset = ($page - 1) * $limit;

        $data = $this->repository->searchBidangIlmu($search, $limit, $offset);
        $total = $this->repository->countBidangIlmu($search);

        return [
            'success' => true,
            'message' => 'Bidang ilmu retrieved successfully',
            'data' => array_map(function ($item) {
                return [
                    'id_kel_bidang' => $item->id_kel_bidang,
                    'kode_kel_bidang' => $item->kode_kel_bidang,
                    'nm_kel_bidang' => $item->nm_kel_bidang,
                    'ket_kel_bidang' => $item->ket_kel_bidang,
                    'total_dosen' => (int) $item->total_dosen,
                ];
            }, $data),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
            ],
        ];
    }

    /**
     * Get bidang ilmu detail with list of dosen
     */
    public function getBidangIlmuDetail(string $idKelBidang)
    {
        // Get basic info
        $info = $this->repository->getBidangIlmuInfo($idKelBidang);

        if (!$info) {
            return [
                'success' => false,
                'message' => 'Bidang ilmu not found',
                'data' => null,
            ];
        }

        // Get list of dosen
        $dosen = $this->repository->getDosenByBidangIlmu($idKelBidang);

        return [
            'success' => true,
            'message' => 'Bidang ilmu detail retrieved successfully',
            'data' => [
                'id_kel_bidang' => $info->id_kel_bidang,
                'kode_kel_bidang' => $info->kode_kel_bidang,
                'nm_kel_bidang' => $info->nm_kel_bidang,
                'ket_kel_bidang' => $info->ket_kel_bidang,
                'kat_kel' => $info->kat_kel,
                'induk_bidang' => $info->induk_bidang,
                'dosen' => array_map(function ($d) {
                    return [
                        'id_sdm' => $d->id_sdm,
                        'encrypted_id' => Crypt::encryptString($d->id_sdm),
                        'nama' => ucwords(strtolower($d->nama)),
                        'nidn' => $d->nidn,
                        'nuptk' => $d->nuptk,
                        'jenis_kelamin' => $d->jenis_kelamin,
                        'jabatan_fungsional' => $d->jabatan_fungsional,
                        'prodi' => $d->prodi,
                        'jenjang' => $d->jenjang,
                        'urutan' => (int) $d->urutan,
                    ];
                }, $dosen),
                'statistics' => [
                    'total_dosen' => count($dosen),
                ],
            ],
        ];
    }
}
