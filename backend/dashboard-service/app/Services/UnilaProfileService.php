<?php

namespace App\Services;

use App\Repositories\UnilaProfileRepository;
use Illuminate\Support\Facades\Cache;

class UnilaProfileService
{
    private UnilaProfileRepository $repository;

    public function __construct(UnilaProfileRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get Unila profile information with caching
     *
     * @return array
     */
    public function getUnilaProfile(): array
    {
        $cacheKey = 'unila_profile';

        return Cache::remember($cacheKey, 3600, function () {
            $profile = $this->repository->getUnilaProfile();

            return [
                'id_sp' => $profile->id_sp,
                'nama_lengkap' => $profile->nm_lemb,
                'nama_singkat' => $profile->nm_singkat,
                'kode_pt' => $profile->npsn,
                'alamat' => $profile->jln,
                'kota' => $profile->ds_kel,
                'kode_pos' => $profile->kode_pos,
                'telepon' => $profile->no_tel,
                'fax' => $profile->no_fax,
                'email' => $profile->email,
                'website' => $profile->website,
                'status_pt' => $profile->stat_sp,
                'sk_pendirian' => $profile->sk_pendirian_sp,
                'tanggal_sk_pendirian' => $profile->tgl_sk_pendirian_sp ? date('Y-m-d', strtotime($profile->tgl_sk_pendirian_sp)) : null,
                'tanggal_berdiri' => $profile->tgl_berdiri ? date('Y-m-d', strtotime($profile->tgl_berdiri)) : null,
                'luas_tanah_milik' => (int) ($profile->luas_tanah_milik ?? 0),
                'luas_tanah_bukan_milik' => (int) ($profile->luas_tanah_bukan_milik ?? 0),
                'npwp' => $profile->npwp ? trim($profile->npwp) : null,
                'akreditasi' => $profile->nm_akred ? trim($profile->nm_akred) : null,
                'sk_akreditasi' => $profile->sk_akred_sp ?? null,
                'tanggal_sk_akreditasi' => $profile->tgl_sk_akred_sp ? date('Y-m-d', strtotime($profile->tgl_sk_akred_sp)) : null,
                'tanggal_berakhir_akreditasi' => $profile->tst_sk_akred_sp ? date('Y-m-d', strtotime($profile->tst_sk_akred_sp)) : null,
                'biaya_kuliah' => [
                    'min' => (int) ($profile->min_biaya ?? 0),
                    'max' => (int) ($profile->max_biaya ?? 0),
                ],
            ];
        });
    }
}
