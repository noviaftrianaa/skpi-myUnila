<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get complete user profile with roles and detailed data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile(Request $request)
    {
        try {
            // Get user from JWT token (set by jwt.auth middleware)
            // Try multiple ways to get the authenticated user
            $authUser = $request->attributes->get('auth_user');

            if (!$authUser) {
                $authUser = auth()->user();
            }

            if (!$authUser) {
                $authUser = $request->user();
            }

            if (empty($authUser)) {
                return $this->errorResponse('User tidak terautentikasi', 401);
            }

            // Get id_pengguna from user object
            $idPengguna = null;
            if (is_object($authUser)) {
                $idPengguna = $authUser->id_pengguna ?? $authUser->id ?? null;
            } elseif (is_array($authUser)) {
                $idPengguna = $authUser['id_pengguna'] ?? $authUser['id'] ?? null;
            }

            if (empty($idPengguna)) {
                return $this->errorResponse('ID Pengguna tidak ditemukan dalam token', 401);
            }

            // Get basic user info
            $user = $this->getUserById($idPengguna);
            if (empty($user)) {
                return $this->errorResponse('Pengguna tidak ditemukan', 404);
            }

            // Get all roles for user
            $roles = $this->getUserRoles($idPengguna);

            // Determine profile type and get detailed profile
            $profileType = null;
            $profileData = null;

            // Get from pengguna table
            $idSDM = $user->id_sdm_pengguna ?? null;
            $idPD = $user->id_pd_pengguna ?? null;

            // If no ID linked, try to find by email or username for staff
            if (empty($idSDM) && empty($idPD)) {
                // Try to find SDM by email (for staff/dosen)
                if (!empty($user->email)) {
                    $sdmByEmail = DB::selectOne("
                        SELECT TOP 1 id_sdm
                        FROM pdrd.sdm WITH(NOLOCK)
                        WHERE LOWER(email) = LOWER(?)
                        AND id_sdm IS NOT NULL
                    ", [$user->email]);

                    if ($sdmByEmail) {
                        $idSDM = $sdmByEmail->id_sdm;
                    }
                }

                // If still not found, try PD by email (for mahasiswa)
                if (empty($idSDM) && empty($idPD) && !empty($user->email)) {
                    $pdByEmail = DB::selectOne("
                        SELECT TOP 1 id_pd
                        FROM pdrd.peserta_didik WITH(NOLOCK)
                        WHERE LOWER(email) = LOWER(?)
                        AND id_pd IS NOT NULL
                    ", [$user->email]);

                    if ($pdByEmail) {
                        $idPD = $pdByEmail->id_pd;
                    }
                }
            }

            // Get id_user_sikep for tendik
            $idUserSikep = $user->id_user_sikep ?? null;

            // Get detailed profile based on type
            // Priority: id_pd (mahasiswa) > id_sdm (dosen) > id_user_sikep (tendik)
            if (!empty($idPD)) {
                $profileType = 'mahasiswa';
                $profileData = $this->getMahasiswaProfile($idPD);
            } elseif (!empty($idSDM)) {
                $profileType = 'dosen';
                $profileData = $this->getDosenProfile($idSDM);
            } elseif (!empty($idUserSikep)) {
                $profileType = 'tendik';
                $profileData = $this->getTendikProfile($idUserSikep);
            }

            // Format roles
            $formattedRoles = [];
            $activeRole = null;
            foreach ($roles as $role) {
                $roleInfo = [
                    'id_role_pengguna' => $role->id_role_pengguna,
                    'id_peran' => $role->id_peran,
                    'nama_peran' => $role->nm_peran,
                    'id_unit' => null, // unit not available in current schema
                    'nama_unit' => null, // unit name not available in current schema
                    'approval_peran' => $role->approval_peran == 1,
                ];
                $formattedRoles[] = $roleInfo;

                // Set active role (first approved role)
                if ($activeRole === null && $role->approval_peran == 1) {
                    $activeRole = $roleInfo;
                }
            }

            // Build response
            $response = [
                'id_pengguna' => $user->id_pengguna,
                'username' => $user->username,
                'nama' => $user->nm_pengguna,
                'email' => $user->email,
                'no_hp' => $user->no_hp ?? null,
                'alamat' => $user->alamat ?? null,
                'tempat_lahir' => $user->tempat_lahir ?? null,
                'tgl_lahir' => $user->tgl_lahir ?? null,
                'jenis_kelamin' => $user->jenis_kelamin ?? null,
                'id_sdm_pengguna' => $idSDM ?? $user->id_sdm_pengguna ?? null,
                'id_pd_pengguna' => $idPD ?? $user->id_pd_pengguna ?? null,
                'id_user_sikep' => $user->id_user_sikep ?? null,
                'roles' => $formattedRoles,
                'active_role' => $activeRole,
                'profile_type' => $profileType,
                'profile_data' => $profileData,
            ];

            return $this->successResponse($response, 'Berhasil mengambil data profil');
        } catch (\Exception $e) {
            Log::error('ProfileController@getProfile: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return $this->errorResponse('Gagal mengambil data profil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user by ID
     */
    private function getUserById($idPengguna)
    {
        $query = "
            SELECT
                id_pengguna,
                username,
                nm_pengguna,
                email,
                no_hp,
                alamat,
                tempat_lahir,
                tgl_lahir,
                jenis_kelamin,
                id_sdm_pengguna,
                id_pd_pengguna,
                id_user_sikep
            FROM man_akses.pengguna WITH(NOLOCK)
            WHERE id_pengguna = ? AND soft_delete = 0
        ";

        $result = DB::select($query, [$idPengguna]);
        return !empty($result) ? $result[0] : null;
    }

    /**
     * Get all roles for user
     */
    private function getUserRoles($idPengguna)
    {
        $query = "
            SELECT
                rp.id_role_pengguna,
                rp.id_peran,
                CASE
                    WHEN rp.id_peran = 4001 THEN 'API_AKADEMIK'
                    WHEN rp.id_peran = 4002 THEN 'API_KEPEGAWAIAN'
                    ELSE p.nm_peran
                END AS nm_peran,
                rp.approval_peran
            FROM man_akses.role_pengguna AS rp WITH(NOLOCK)
            LEFT JOIN man_akses.peran AS p WITH(NOLOCK) ON rp.id_peran = p.id_peran
            WHERE rp.id_pengguna = ? AND rp.soft_delete = 0
            ORDER BY rp.approval_peran DESC, rp.id_peran
        ";

        return DB::select($query, [$idPengguna]);
    }

    /**
     * Get dosen/tendik detailed profile with multiple homebase (reg_ptk)
     * Complete data from pdrd.sdm with all reference table joins
     */
    private function getDosenProfile($idSDM)
    {
        // Get complete SDM data with all reference joins
        $query = "
            SELECT
                s.id_sdm,
                s.nm_sdm,
                s.nik,
                s.nidn,
                s.nip,
                s.nuptk,
                s.niy_nigk,
                s.nsdmi,
                s.nira,
                s.jk,
                s.tmpt_lahir,
                s.tgl_lahir,
                s.id_agama,
                ref_agama.nm_agama,
                s.stat_kawin,
                CASE
                    WHEN s.stat_kawin = 0 THEN 'Belum Kawin'
                    WHEN s.stat_kawin = 1 THEN 'Kawin'
                    WHEN s.stat_kawin = 2 THEN 'Cerai Hidup'
                    WHEN s.stat_kawin = 3 THEN 'Cerai Mati'
                    ELSE 'Tidak Diketahui'
                END AS ket_stat_kawin,
                s.kewarganegaraan,
                ref_negara.nm_negara AS nama_negara,
                -- Alamat lengkap
                s.jln,
                s.rt,
                s.rw,
                s.nm_dsn,
                s.ds_kel,
                s.kode_pos,
                s.id_wil,
                ref_wil.nm_wil AS nama_wilayah,
                -- Kontak
                s.no_tel_rmh,
                s.no_hp,
                s.email,
                -- Kepegawaian
                s.id_jns_sdm,
                ref_jenis.nm_jns_sdm,
                s.id_stat_aktif,
                ref_status.nm_stat_aktif,
                s.tmt_pns,
                s.sk_cpns,
                s.tgl_sk_cpns,
                s.sk_angkat,
                s.tmt_sk_angkat,
                s.akta_ijin_ajar,
                -- Lembaga pengangkat
                s.id_lemb_angkat,
                ref_lemb_angkat.nm_lemb_angkat AS lembaga_pengangkat,
                -- Sumber gaji
                s.id_sumber_gaji,
                ref_sumber_gaji.nm_sumber_gaji AS sumber_gaji,
                -- Keahlian lab
                s.id_keahlian_lab,
                ref_keahlian.nm_keahlian_lab AS keahlian_lab,
                -- Data pasangan
                s.nm_suami_istri,
                s.nip_suami_istri,
                s.id_pekerjaan_suami_istri,
                ref_pekerjaan_pasangan.nm_pekerjaan AS pekerjaan_suami_istri,
                -- Pajak
                s.npwp,
                s.nm_wp
            FROM pdrd.sdm AS s WITH(NOLOCK)
            LEFT JOIN ref.agama AS ref_agama WITH(NOLOCK) ON s.id_agama = ref_agama.id_agama
            LEFT JOIN ref.jenis_sdm AS ref_jenis WITH(NOLOCK) ON s.id_jns_sdm = ref_jenis.id_jns_sdm
            LEFT JOIN ref.status_keaktifan_pegawai AS ref_status WITH(NOLOCK) ON s.id_stat_aktif = ref_status.id_stat_aktif
            LEFT JOIN ref.negara AS ref_negara WITH(NOLOCK) ON s.kewarganegaraan = ref_negara.id_negara
            LEFT JOIN ref.wilayah AS ref_wil WITH(NOLOCK) ON s.id_wil = ref_wil.id_wil
            LEFT JOIN ref.lembaga_pengangkat AS ref_lemb_angkat WITH(NOLOCK) ON s.id_lemb_angkat = ref_lemb_angkat.id_lemb_angkat
            LEFT JOIN ref.sumber_gaji AS ref_sumber_gaji WITH(NOLOCK) ON s.id_sumber_gaji = ref_sumber_gaji.id_sumber_gaji
            LEFT JOIN ref.keahlian_lab AS ref_keahlian WITH(NOLOCK) ON s.id_keahlian_lab = ref_keahlian.id_keahlian_lab
            LEFT JOIN ref.pekerjaan AS ref_pekerjaan_pasangan WITH(NOLOCK) ON s.id_pekerjaan_suami_istri = ref_pekerjaan_pasangan.id_pekerjaan
            WHERE s.id_sdm = ?
        ";

        $result = DB::select($query, [$idSDM]);

        if (empty($result)) {
            return null;
        }

        $sdm = $result[0];

        // Get all homebase (reg_ptk) for this SDM
        $homebases = $this->getDosenHomebases($idSDM);

        return [
            'id_sdm' => $sdm->id_sdm,
            'nama' => $sdm->nm_sdm,
            'nik' => $sdm->nik,
            'nidn' => $sdm->nidn,
            'nip' => $sdm->nip,
            'nuptk' => $sdm->nuptk,
            'niy_nigk' => $sdm->niy_nigk,
            'nsdmi' => $sdm->nsdmi,
            'nira' => $sdm->nira,
            'jenis_kelamin' => $sdm->jk,
            'tempat_lahir' => $sdm->tmpt_lahir,
            'tanggal_lahir' => $sdm->tgl_lahir,
            'agama' => $sdm->nm_agama,
            'status_kawin' => $sdm->ket_stat_kawin,
            'kewarganegaraan' => $sdm->nama_negara,
            'alamat' => [
                'jalan' => $sdm->jln,
                'rt' => $sdm->rt,
                'rw' => $sdm->rw,
                'dusun' => $sdm->nm_dsn,
                'desa_kelurahan' => $sdm->ds_kel,
                'kode_pos' => $sdm->kode_pos,
                'wilayah' => $sdm->nama_wilayah,
            ],
            'kontak' => [
                'telepon_rumah' => $sdm->no_tel_rmh,
                'no_hp' => $sdm->no_hp,
                'email' => $sdm->email,
            ],
            'kepegawaian' => [
                'jenis_sdm' => $sdm->nm_jns_sdm,
                'status_aktif' => $sdm->nm_stat_aktif,
                'tmt_pns' => $sdm->tmt_pns,
                'sk_cpns' => $sdm->sk_cpns,
                'tanggal_sk_cpns' => $sdm->tgl_sk_cpns,
                'sk_angkat' => $sdm->sk_angkat,
                'tmt_sk_angkat' => $sdm->tmt_sk_angkat,
                'lembaga_pengangkat' => $sdm->lembaga_pengangkat,
                'sumber_gaji' => $sdm->sumber_gaji,
                'akta_ijin_ajar' => $sdm->akta_ijin_ajar == '1',
                'keahlian_lab' => $sdm->keahlian_lab,
            ],
            'pasangan' => [
                'nama' => $sdm->nm_suami_istri,
                'nip' => $sdm->nip_suami_istri,
                'pekerjaan' => $sdm->pekerjaan_suami_istri,
            ],
            'pajak' => [
                'npwp' => $sdm->npwp,
                'nama_wp' => $sdm->nm_wp,
            ],
            // Multiple homebase support
            'homebases' => $homebases,
        ];
    }

    /**
     * Get all homebase (reg_ptk) for a dosen/tendik
     */
    private function getDosenHomebases($idSDM)
    {
        $query = "
            SELECT
                rp.id_reg_ptk,
                rp.id_sms,
                sms.nm_lemb AS nama_unit,
                sms.kode_prodi,
                jj.nm_jenj_didik AS jenjang,
                rp.no_srt_tgs,
                rp.tgl_srt_tgs,
                rp.tmt_srt_tgs,
                rp.tgl_ptk_keluar,
                rp.nidn,
                ref_stat.nm_stat_pegawai AS status_pegawai,
                ref_ikatan.nm_ikatan_kerja AS ikatan_kerja,
                ref_jns_keluar.ket_keluar AS keterangan_keluar,
                CASE
                    WHEN rp.tgl_ptk_keluar IS NULL THEN 1
                    ELSE 0
                END AS is_active
            FROM pdrd.reg_ptk AS rp WITH(NOLOCK)
            INNER JOIN pdrd.sms AS sms WITH(NOLOCK) ON rp.id_sms = sms.id_sms
            LEFT JOIN ref.jenjang_pendidikan AS jj WITH(NOLOCK) ON sms.id_jenj_didik = jj.id_jenj_didik
            LEFT JOIN ref.status_kepegawaian AS ref_stat WITH(NOLOCK) ON rp.id_stat_pegawai = ref_stat.id_stat_pegawai
            LEFT JOIN ref.ikatan_kerja_sdm AS ref_ikatan WITH(NOLOCK) ON rp.id_ikatan_kerja = ref_ikatan.id_ikatan_kerja
            LEFT JOIN ref.jenis_keluar AS ref_jns_keluar WITH(NOLOCK) ON rp.id_jns_keluar = ref_jns_keluar.id_jns_keluar
            WHERE rp.id_sdm = ?
                AND rp.soft_delete = 0
            ORDER BY rp.tmt_srt_tgs DESC
        ";

        $results = DB::select($query, [$idSDM]);

        return array_map(function ($row) {
            return [
                'id_reg_ptk' => $row->id_reg_ptk,
                'id_sms' => $row->id_sms,
                'nama_unit' => trim($row->nama_unit ?? ''),
                'kode_prodi' => trim($row->kode_prodi ?? ''),
                'jenjang' => trim($row->jenjang ?? ''),
                'no_surat_tugas' => $row->no_srt_tgs,
                'tanggal_surat_tugas' => $row->tgl_srt_tgs,
                'tmt_surat_tugas' => $row->tmt_srt_tgs,
                'tanggal_keluar' => $row->tgl_ptk_keluar,
                'nidn' => $row->nidn,
                'status_pegawai' => trim($row->status_pegawai ?? ''),
                'ikatan_kerja' => trim($row->ikatan_kerja ?? ''),
                'keterangan_keluar' => trim($row->keterangan_keluar ?? ''),
                'is_active' => $row->is_active == 1,
            ];
        }, $results);
    }

    /**
     * Get mahasiswa detailed profile with multiple homebase (reg_pd)
     */
    private function getMahasiswaProfile($idPD)
    {
        // Get complete peserta_didik data with all reference joins
        $query = "
            SELECT
                pd.id_pd,
                pd.nm_pd,
                pd.nik,
                pd.nisn,
                pd.jk,
                pd.tmpt_lahir,
                pd.tgl_lahir,
                pd.id_agama,
                ref_agama.nm_agama,
                pd.id_kewarganegaraan,
                ref_negara.nm_negara AS kewarganegaraan,
                pd.jln,
                pd.rt,
                pd.rw,
                pd.nm_dsn,
                pd.ds_kel,
                pd.kode_pos,
                pd.id_wil,
                ref_wil.nm_wil AS nama_wilayah,
                pd.id_jns_tinggal,
                ref_tinggal.nm_jns_tinggal AS jenis_tinggal,
                pd.id_alat_transport,
                pd.tlpn_rumah,
                pd.tlpn_hp,
                pd.email,
                pd.id_stat_mhs,
                ref_stat_mhs.nm_stat_mhs,
                -- Beasiswa/KPS
                pd.a_terima_kps,
                pd.no_kps,
                pd.a_bidikmisi,
                pd.a_pmpap,
                -- Kebutuhan Khusus
                pd.id_kk,
                ref_kk.nm_kk AS kebutuhan_khusus,
                -- Data Ayah
                pd.nm_ayah,
                pd.tgl_lahir_ayah,
                pd.nik_ayah,
                pd.id_pekerjaan_ayah,
                ref_pekerjaan_ayah.nm_pekerjaan AS pekerjaan_ayah,
                pd.id_penghasilan_ayah,
                ref_penghasilan_ayah.nm_penghasilan AS penghasilan_ayah,
                pd.id_pendidikan_ayah,
                ref_pendidikan_ayah.nm_jenj_didik AS pendidikan_ayah,
                pd.id_kk_ayah,
                ref_kk_ayah.nm_kk AS kebutuhan_khusus_ayah,
                -- Data Ibu
                pd.nm_ibu_kandung,
                pd.tgl_lahir_ibu,
                pd.nik_ibu,
                pd.id_pekerjaan_ibu,
                ref_pekerjaan_ibu.nm_pekerjaan AS pekerjaan_ibu,
                pd.id_penghasilan_ibu,
                ref_penghasilan_ibu.nm_penghasilan AS penghasilan_ibu,
                pd.id_pendidikan_ibu,
                ref_pendidikan_ibu.nm_jenj_didik AS pendidikan_ibu,
                pd.id_kk_ibu,
                ref_kk_ibu.nm_kk AS kebutuhan_khusus_ibu,
                -- Data Wali
                pd.nm_wali,
                pd.tgl_lahir_wali,
                pd.id_pekerjaan_wali,
                ref_pekerjaan_wali.nm_pekerjaan AS pekerjaan_wali,
                pd.id_penghasilan_wali,
                ref_penghasilan_wali.nm_penghasilan AS penghasilan_wali,
                pd.id_pendidikan_wali,
                ref_pendidikan_wali.nm_jenj_didik AS pendidikan_wali
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            LEFT JOIN ref.agama AS ref_agama WITH(NOLOCK) ON pd.id_agama = ref_agama.id_agama
            LEFT JOIN ref.status_mahasiswa AS ref_stat_mhs WITH(NOLOCK) ON pd.id_stat_mhs = ref_stat_mhs.id_stat_mhs
            LEFT JOIN ref.negara AS ref_negara WITH(NOLOCK) ON pd.id_kewarganegaraan = ref_negara.id_negara
            LEFT JOIN ref.wilayah AS ref_wil WITH(NOLOCK) ON pd.id_wil = ref_wil.id_wil
            LEFT JOIN ref.jenis_tinggal AS ref_tinggal WITH(NOLOCK) ON pd.id_jns_tinggal = ref_tinggal.id_jns_tinggal
            LEFT JOIN ref.kebutuhan_khusus AS ref_kk WITH(NOLOCK) ON pd.id_kk = ref_kk.id_kk
            -- Referensi Ayah
            LEFT JOIN ref.pekerjaan AS ref_pekerjaan_ayah WITH(NOLOCK) ON pd.id_pekerjaan_ayah = ref_pekerjaan_ayah.id_pekerjaan
            LEFT JOIN ref.penghasilan AS ref_penghasilan_ayah WITH(NOLOCK) ON pd.id_penghasilan_ayah = ref_penghasilan_ayah.id_penghasilan
            LEFT JOIN ref.jenjang_pendidikan AS ref_pendidikan_ayah WITH(NOLOCK) ON pd.id_pendidikan_ayah = ref_pendidikan_ayah.id_jenj_didik
            LEFT JOIN ref.kebutuhan_khusus AS ref_kk_ayah WITH(NOLOCK) ON pd.id_kk_ayah = ref_kk_ayah.id_kk
            -- Referensi Ibu
            LEFT JOIN ref.pekerjaan AS ref_pekerjaan_ibu WITH(NOLOCK) ON pd.id_pekerjaan_ibu = ref_pekerjaan_ibu.id_pekerjaan
            LEFT JOIN ref.penghasilan AS ref_penghasilan_ibu WITH(NOLOCK) ON pd.id_penghasilan_ibu = ref_penghasilan_ibu.id_penghasilan
            LEFT JOIN ref.jenjang_pendidikan AS ref_pendidikan_ibu WITH(NOLOCK) ON pd.id_pendidikan_ibu = ref_pendidikan_ibu.id_jenj_didik
            LEFT JOIN ref.kebutuhan_khusus AS ref_kk_ibu WITH(NOLOCK) ON pd.id_kk_ibu = ref_kk_ibu.id_kk
            -- Referensi Wali
            LEFT JOIN ref.pekerjaan AS ref_pekerjaan_wali WITH(NOLOCK) ON pd.id_pekerjaan_wali = ref_pekerjaan_wali.id_pekerjaan
            LEFT JOIN ref.penghasilan AS ref_penghasilan_wali WITH(NOLOCK) ON pd.id_penghasilan_wali = ref_penghasilan_wali.id_penghasilan
            LEFT JOIN ref.jenjang_pendidikan AS ref_pendidikan_wali WITH(NOLOCK) ON pd.id_pendidikan_wali = ref_pendidikan_wali.id_jenj_didik
            WHERE pd.id_pd = ?
        ";

        $result = DB::select($query, [$idPD]);

        if (empty($result)) {
            return null;
        }

        $mhs = $result[0];

        // Get all homebase (reg_pd) for this mahasiswa - support D3 to S1, etc
        $homebases = $this->getMahasiswaHomebases($idPD);

        return [
            'id_pd' => $mhs->id_pd,
            'nama' => $mhs->nm_pd,
            'nik' => $mhs->nik,
            'nisn' => $mhs->nisn,
            'jenis_kelamin' => $mhs->jk,
            'tempat_lahir' => $mhs->tmpt_lahir,
            'tanggal_lahir' => $mhs->tgl_lahir,
            'agama' => $mhs->nm_agama,
            'kewarganegaraan' => $mhs->kewarganegaraan,
            'status_mahasiswa' => $mhs->nm_stat_mhs,
            'jenis_tinggal' => $mhs->jenis_tinggal,
            'kebutuhan_khusus' => $mhs->kebutuhan_khusus,
            'beasiswa' => [
                'terima_kps' => $mhs->a_terima_kps == 1,
                'no_kps' => $mhs->no_kps,
                'bidikmisi' => $mhs->a_bidikmisi == 1,
                'pmpap' => $mhs->a_pmpap == 1,
            ],
            'alamat' => [
                'jalan' => $mhs->jln,
                'rt' => $mhs->rt,
                'rw' => $mhs->rw,
                'dusun' => $mhs->nm_dsn,
                'desa_kelurahan' => $mhs->ds_kel,
                'kode_pos' => $mhs->kode_pos,
                'wilayah' => $mhs->nama_wilayah,
            ],
            'kontak' => [
                'telepon_rumah' => $mhs->tlpn_rumah,
                'no_hp' => $mhs->tlpn_hp,
                'email' => $mhs->email,
            ],
            'keluarga' => [
                'ayah' => [
                    'nama' => $mhs->nm_ayah,
                    'tanggal_lahir' => $mhs->tgl_lahir_ayah,
                    'nik' => $mhs->nik_ayah,
                    'pekerjaan' => $mhs->pekerjaan_ayah,
                    'penghasilan' => $mhs->penghasilan_ayah,
                    'pendidikan' => $mhs->pendidikan_ayah,
                    'kebutuhan_khusus' => $mhs->kebutuhan_khusus_ayah,
                ],
                'ibu' => [
                    'nama' => $mhs->nm_ibu_kandung,
                    'tanggal_lahir' => $mhs->tgl_lahir_ibu,
                    'nik' => $mhs->nik_ibu,
                    'pekerjaan' => $mhs->pekerjaan_ibu,
                    'penghasilan' => $mhs->penghasilan_ibu,
                    'pendidikan' => $mhs->pendidikan_ibu,
                    'kebutuhan_khusus' => $mhs->kebutuhan_khusus_ibu,
                ],
                'wali' => [
                    'nama' => $mhs->nm_wali,
                    'tanggal_lahir' => $mhs->tgl_lahir_wali,
                    'pekerjaan' => $mhs->pekerjaan_wali,
                    'penghasilan' => $mhs->penghasilan_wali,
                    'pendidikan' => $mhs->pendidikan_wali,
                ],
            ],
            // Multiple homebase support (D3 -> S1, etc)
            'homebases' => $homebases,
        ];
    }

    /**
     * Get all homebase (reg_pd) for a mahasiswa
     * This supports cases like D3 to S1 progression
     */
    private function getMahasiswaHomebases($idPD)
    {
        $query = "
            SELECT
                rp.id_reg_pd,
                rp.nipd AS nim,
                rp.tgl_masuk_sp,
                rp.tgl_keluar,
                rp.id_jns_keluar,
                ref_jns_keluar.ket_keluar,
                CAST(rp.sks_diakui AS INT) AS sks_diakui,
                rp.ipk,
                rp.id_pt_asal,
                rp.nm_pt_asal,
                rp.id_prodi_asal,
                rp.nm_prodi_asal,
                sms.id_sms,
                sms.nm_lemb AS nama_prodi,
                sms.kode_prodi,
                jj.id_jenj_didik AS id_jenjang,
                jj.nm_jenj_didik AS nama_jenjang,
                CASE
                    WHEN rp.tgl_keluar IS NULL THEN 1
                    ELSE 0
                END AS is_active
            FROM pdrd.reg_pd AS rp WITH(NOLOCK)
            LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON rp.id_sms = sms.id_sms
            LEFT JOIN ref.jenjang_pendidikan AS jj WITH(NOLOCK) ON sms.id_jenj_didik = jj.id_jenj_didik
            LEFT JOIN ref.jenis_keluar AS ref_jns_keluar WITH(NOLOCK) ON rp.id_jns_keluar = ref_jns_keluar.id_jns_keluar
            WHERE rp.id_pd = ?
                AND rp.soft_delete = 0
            ORDER BY rp.tgl_masuk_sp DESC
        ";

        $results = DB::select($query, [$idPD]);

        $homebases = [];
        foreach ($results as $row) {
            $homebase = [
                'id_reg_pd' => $row->id_reg_pd,
                'nim' => trim($row->nim ?? ''),
                'id_sms' => $row->id_sms,
                'program_studi' => trim($row->nama_prodi ?? ''),
                'kode_prodi' => trim($row->kode_prodi ?? ''),
                'jenjang' => trim($row->nama_jenjang ?? ''),
                'id_jenjang' => $row->id_jenjang,
                'tanggal_masuk' => $row->tgl_masuk_sp,
                'tanggal_keluar' => $row->tgl_keluar,
                'id_jenis_keluar' => $row->id_jns_keluar,
                'keterangan_keluar' => trim($row->ket_keluar ?? ''),
                'sks_diakui' => $row->sks_diakui,
                'ipk' => $row->ipk,
                'pt_asal' => [
                    'id_pt_asal' => $row->id_pt_asal,
                    'nama_pt_asal' => $row->nm_pt_asal,
                    'id_prodi_asal' => $row->id_prodi_asal,
                    'nama_prodi_asal' => $row->nm_prodi_asal,
                ],
                'is_active' => $row->is_active == 1,
                // Status semester for this specific homebase
                'status_semester' => $this->getStatusSemester($row->id_reg_pd),
            ];

            $homebases[] = $homebase;
        }

        return $homebases;
    }

    /**
     * Get status semester per semester for mahasiswa
     * SKS values are returned as integers (no decimal)
     */
    private function getStatusSemester($idRegPd)
    {
        if (empty($idRegPd)) {
            return [];
        }

        $query = "
            SELECT
                km.id_smt,
                smt.nm_smt AS semester,
                sm.nm_stat_mhs AS status,
                CAST(km.sks_semester AS INT) AS sks_diambil,
                CAST(km.total_sks AS INT) AS total_sks,
                km.ips,
                km.ipk
            FROM pdrd.kuliah_mhs AS km WITH(NOLOCK)
            INNER JOIN ref.semester AS smt WITH(NOLOCK)
                ON smt.id_smt = km.id_smt
                AND smt.expired_date IS NULL
            LEFT JOIN ref.status_mahasiswa AS sm WITH(NOLOCK)
                ON sm.id_stat_mhs = km.id_stat_mhs
                AND sm.expired_date IS NULL
            WHERE km.id_reg_pd = ?
                AND km.soft_delete = 0
            ORDER BY km.id_smt DESC
        ";

        $results = DB::select($query, [$idRegPd]);

        return array_map(function ($row) {
            return [
                'id_smt' => $row->id_smt,
                'semester' => trim($row->semester ?? ''),
                'status' => trim($row->status ?? ''),
                'sks_diambil' => (int) $row->sks_diambil,
                'total_sks' => (int) $row->total_sks,
                'ips' => $row->ips,
                'ipk' => $row->ipk,
            ];
        }, $results);
    }

    /**
     * Get tendik detailed profile from SIKEP
     * Data from sikep.pegawai only (reference tables may not exist yet)
     */
    private function getTendikProfile($idUserSikep)
    {
        // Get pegawai data directly without reference table joins
        // Reference tables (fungsional, struktural, pendidikan, organisasi) may not exist
        $query = "
            SELECT
                p.id_pegawai,
                p.nm_pegawai,
                p.jk,
                p.nip,
                p.nidn,
                p.tmp_lahir,
                p.tgl_lahir,
                p.alamat,
                p.jns_pegawai,
                p.tmt_cpns,
                p.tmt_pns,
                p.jns_tenaga,
                p.status,
                p.tmt_pensiun,
                p.id_golongan,
                p.tmt_gol,
                p.id_fungsional,
                p.tmt_fung,
                p.id_struktural,
                p.id_pendidikan,
                p.id_org1,
                p.id_org2,
                p.id_org3
            FROM sikep.pegawai AS p WITH(NOLOCK)
            WHERE p.id_pegawai = ?
        ";

        $result = DB::select($query, [$idUserSikep]);

        if (empty($result)) {
            return null;
        }

        $pegawai = $result[0];

        // Try to get golongan name from reference tables if they exist
        $golongan = null;
        $pangkat = null;
        if (!empty($pegawai->id_golongan)) {
            try {
                $golResult = DB::selectOne("
                    SELECT nm_gol AS golongan, nm_pangkat AS pangkat
                    FROM sikep.golongan_pns WITH(NOLOCK)
                    WHERE id_gol = ?
                ", [$pegawai->id_golongan]);

                if ($golResult) {
                    $golongan = $golResult->golongan;
                    $pangkat = $golResult->pangkat;
                } else {
                    // Try PPPK table
                    $golResult = DB::selectOne("
                        SELECT golongan, pangkat
                        FROM sikep.golongan_pppk WITH(NOLOCK)
                        WHERE id = ?
                    ", [$pegawai->id_golongan]);

                    if ($golResult) {
                        $golongan = $golResult->golongan;
                        $pangkat = $golResult->pangkat;
                    }
                }
            } catch (\Exception $e) {
                // Tables may not exist, use ID as fallback
                $golongan = $pegawai->id_golongan;
            }
        }

        // Try to get jabatan fungsional name
        $jabatanFungsional = null;
        if (!empty($pegawai->id_fungsional)) {
            try {
                $jfResult = DB::selectOne("
                    SELECT nm_jabfung FROM sikep.fungsional WITH(NOLOCK) WHERE id_jabfung = ?
                ", [$pegawai->id_fungsional]);
                $jabatanFungsional = $jfResult ? $jfResult->nm_jabfung : $pegawai->id_fungsional;
            } catch (\Exception $e) {
                $jabatanFungsional = $pegawai->id_fungsional;
            }
        }

        // Try to get jabatan struktural name
        $jabatanStruktural = null;
        if (!empty($pegawai->id_struktural)) {
            try {
                $jsResult = DB::selectOne("
                    SELECT nm_jabstruk FROM sikep.struktural WITH(NOLOCK) WHERE id_jabstruk = ?
                ", [$pegawai->id_struktural]);
                $jabatanStruktural = $jsResult ? $jsResult->nm_jabstruk : $pegawai->id_struktural;
            } catch (\Exception $e) {
                $jabatanStruktural = $pegawai->id_struktural;
            }
        }

        // Try to get pendidikan name
        $pendidikan = null;
        if (!empty($pegawai->id_pendidikan)) {
            try {
                $pendResult = DB::selectOne("
                    SELECT nm_pend FROM sikep.pendidikan WITH(NOLOCK) WHERE id_pend = ?
                ", [$pegawai->id_pendidikan]);
                $pendidikan = $pendResult ? $pendResult->nm_pend : $pegawai->id_pendidikan;
            } catch (\Exception $e) {
                $pendidikan = $pegawai->id_pendidikan;
            }
        }

        // Try to get unit kerja names from sikep.unit_orga
        $unitKerja1 = null;
        $unitKerja2 = null;
        $unitKerja3 = null;
        try {
            if (!empty($pegawai->id_org1)) {
                $org1Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$pegawai->id_org1]);
                $unitKerja1 = $org1Result ? $org1Result->nm_unit_orga : $pegawai->id_org1;
            }
            if (!empty($pegawai->id_org2)) {
                $org2Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$pegawai->id_org2]);
                $unitKerja2 = $org2Result ? $org2Result->nm_unit_orga : $pegawai->id_org2;
            }
            if (!empty($pegawai->id_org3)) {
                $org3Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$pegawai->id_org3]);
                $unitKerja3 = $org3Result ? $org3Result->nm_unit_orga : $pegawai->id_org3;
            }
        } catch (\Exception $e) {
            // Table sikep.unit_orga may not exist, use IDs as fallback
            $unitKerja1 = $pegawai->id_org1;
            $unitKerja2 = $pegawai->id_org2;
            $unitKerja3 = $pegawai->id_org3;
        }

        // Helper to trim and return null if empty
        $trimOrNull = function ($value) {
            if ($value === null) return null;
            $trimmed = trim($value);
            return $trimmed === '' ? null : $trimmed;
        };

        return [
            'id_pegawai' => $pegawai->id_pegawai,
            'nama' => $trimOrNull($pegawai->nm_pegawai),
            'nip' => $trimOrNull($pegawai->nip),
            'nidn' => $trimOrNull($pegawai->nidn),
            'jenis_kelamin' => $trimOrNull($pegawai->jk),
            'tempat_lahir' => $trimOrNull($pegawai->tmp_lahir),
            'tanggal_lahir' => $trimOrNull($pegawai->tgl_lahir),
            'alamat' => $trimOrNull($pegawai->alamat),
            'jenis_pegawai' => $trimOrNull($pegawai->jns_pegawai),
            'jenis_tenaga' => $trimOrNull($pegawai->jns_tenaga),
            'status' => $trimOrNull($pegawai->status),
            'kepegawaian' => [
                'tmt_cpns' => $trimOrNull($pegawai->tmt_cpns),
                'tmt_pns' => $trimOrNull($pegawai->tmt_pns),
                'tmt_pensiun' => $trimOrNull($pegawai->tmt_pensiun),
                'golongan' => $trimOrNull($golongan),
                'pangkat' => $trimOrNull($pangkat),
                'tmt_golongan' => $trimOrNull($pegawai->tmt_gol),
                'jabatan_fungsional' => $trimOrNull($jabatanFungsional),
                'tmt_fungsional' => $trimOrNull($pegawai->tmt_fung),
                'jabatan_struktural' => $trimOrNull($jabatanStruktural),
                'pendidikan' => $trimOrNull($pendidikan),
            ],
            'unit_kerja' => [
                'unit_1' => $trimOrNull($unitKerja1),
                'unit_2' => $trimOrNull($unitKerja2),
                'unit_3' => $trimOrNull($unitKerja3),
            ],
        ];
    }
}
