<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Get complete user profile with roles and detailed data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile()
    {
        try {
            // id_pengguna is injected by AuthApi middleware
            $idPengguna = $this->request->id_pengguna;

            if (empty($idPengguna)) {
                return WrapResponse(['data' => null], 'ID Pengguna tidak ditemukan', false);
            }

            // Get basic user info
            $user = $this->getUserById($idPengguna);
            if (empty($user)) {
                return WrapResponse(['data' => null], 'Pengguna tidak ditemukan', false);
            }

            // Get all roles for user
            $roles = $this->getUserRoles($idPengguna);

            // Determine profile type and get detailed profile
            $profileType = null;
            $profileData = null;
            $idSDM = null;
            $idPD = null;
            $idUserSikep = null;

            // Check if user has SDM, PD, or SIKEP linked from roles
            foreach ($roles as $role) {
                if (!empty($role->id_sdm_pengguna)) {
                    $idSDM = $role->id_sdm_pengguna;
                }
                if (!empty($role->id_pd_pengguna)) {
                    $idPD = $role->id_pd_pengguna;
                }
                if (!empty($role->id_user_sikep)) {
                    $idUserSikep = $role->id_user_sikep;
                }
            }

            // Also check from pengguna table
            if (empty($idSDM)) {
                $idSDM = $user->id_sdm_pengguna;
            }
            if (empty($idPD)) {
                $idPD = $user->id_pd_pengguna;
            }

            // Get detailed profile based on type
            // Priority: mahasiswa > dosen > tendik
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
                    'id_unit' => $role->id_unit,
                    'nama_unit' => $role->nm_unit,
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
                'roles' => $formattedRoles,
                'active_role' => $activeRole,
                'profile_type' => $profileType,
                'profile_data' => $profileData,
            ];

            return WrapResponse(['data' => $response], 'Berhasil mengambil data profil', true);
        } catch (\Exception $e) {
            Log::error('ProfileController@getProfile: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Gagal mengambil data profil: ' . $e->getMessage(), false);
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
                id_pd_pengguna
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
            SELECT DISTINCT
                rp.id_role_pengguna,
                rp.id_peran,
                p.nm_peran,
                rp.id_unit,
                u.nm_unit,
                rp.approval_peran,
                rp.id_pd_pengguna,
                rp.id_sdm_pengguna,
                rp.id_user_sikep
            FROM man_akses.role_pengguna AS rp WITH(NOLOCK)
            LEFT JOIN man_akses.peran AS p WITH(NOLOCK) ON rp.id_peran = p.id_peran
            LEFT JOIN man_akses.unit AS u WITH(NOLOCK) ON rp.id_unit = u.id_unit
            WHERE rp.id_pengguna = ? AND rp.soft_delete = 0
            ORDER BY rp.approval_peran DESC, p.nm_peran
        ";

        return DB::select($query, [$idPengguna]);
    }

    /**
     * Get dosen/tendik detailed profile
     */
    private function getDosenProfile($idSDM)
    {
        $query = "
            SELECT
                s.id_sdm,
                s.nm_sdm,
                s.nik,
                s.nidn,
                s.nip,
                s.nuptk,
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
                s.jln,
                s.rt,
                s.rw,
                s.ds_kel,
                s.kode_pos,
                s.no_tel_rmh,
                s.no_hp,
                s.email,
                s.id_jenis_sdm,
                ref_jenis.nm_jns_sdm,
                s.id_stat_aktif,
                ref_status.nm_stat_aktif,
                s.tmt_pns,
                s.sk_cpns,
                s.tgl_sk_cpns,
                s.npwp,
                s.nm_wp
            FROM pdrd.sdm AS s WITH(NOLOCK)
            LEFT JOIN ref.agama AS ref_agama WITH(NOLOCK) ON s.id_agama = ref_agama.id_agama
            LEFT JOIN ref.jenis_sdm AS ref_jenis WITH(NOLOCK) ON s.id_jenis_sdm = ref_jenis.id_jenis_sdm
            LEFT JOIN ref.stat_aktif AS ref_status WITH(NOLOCK) ON s.id_stat_aktif = ref_status.id_stat_aktif
            WHERE s.id_sdm = ?
        ";

        $result = DB::select($query, [$idSDM]);

        if (empty($result)) {
            return null;
        }

        $sdm = $result[0];

        return [
            'id_sdm' => $sdm->id_sdm,
            'nama' => $sdm->nm_sdm,
            'nik' => $sdm->nik,
            'nidn' => $sdm->nidn,
            'nip' => $sdm->nip,
            'nuptk' => $sdm->nuptk,
            'jenis_kelamin' => $sdm->jk,
            'tempat_lahir' => $sdm->tmpt_lahir,
            'tanggal_lahir' => $sdm->tgl_lahir,
            'agama' => $sdm->nm_agama,
            'status_kawin' => $sdm->ket_stat_kawin,
            'kewarganegaraan' => $sdm->kewarganegaraan,
            'alamat' => [
                'jalan' => $sdm->jln,
                'rt' => $sdm->rt,
                'rw' => $sdm->rw,
                'desa_kelurahan' => $sdm->ds_kel,
                'kode_pos' => $sdm->kode_pos,
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
            ],
            'pajak' => [
                'npwp' => $sdm->npwp,
                'nama_wp' => $sdm->nm_wp,
            ],
        ];
    }

    /**
     * Get mahasiswa detailed profile
     */
    private function getMahasiswaProfile($idPD)
    {
        $query = "
            SELECT TOP 1
                pd.id_pd,
                pd.nm_pd,
                pd.nik,
                pd.jk,
                pd.tmpt_lahir,
                pd.tgl_lahir,
                pd.id_agama,
                ref_agama.nm_agama,
                pd.kewarganegaraan,
                pd.jln,
                pd.rt,
                pd.rw,
                pd.ds_kel,
                pd.kode_pos,
                pd.no_tel_rmh,
                pd.no_hp,
                pd.email,
                rp.nipd AS nim,
                sms.id_sms,
                sms.nm_lemb AS nama_prodi,
                jj.id_jenj_didik AS id_jenjang,
                jj.nm_jenj_didik AS nama_jenjang,
                rp.id_stat_mhs,
                ref_status.nm_stat_mhs AS status_mahasiswa,
                rp.tgl_masuk_sp
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            LEFT JOIN pdrd.reg_pd AS rp WITH(NOLOCK) ON pd.id_pd = rp.id_pd
            LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON rp.id_sms = sms.id_sms
            LEFT JOIN ref.jenjang_pendidikan AS jj WITH(NOLOCK) ON sms.id_jenj_didik = jj.id_jenj_didik
            LEFT JOIN ref.agama AS ref_agama WITH(NOLOCK) ON pd.id_agama = ref_agama.id_agama
            LEFT JOIN ref.stat_mhs AS ref_status WITH(NOLOCK) ON rp.id_stat_mhs = ref_status.id_stat_mhs
            WHERE pd.id_pd = ?
            ORDER BY rp.id_reg_pd DESC
        ";

        $result = DB::select($query, [$idPD]);

        if (empty($result)) {
            return null;
        }

        $mhs = $result[0];

        return [
            'id_pd' => $mhs->id_pd,
            'nama' => $mhs->nm_pd,
            'nik' => $mhs->nik,
            'nim' => $mhs->nim,
            'jenis_kelamin' => $mhs->jk,
            'tempat_lahir' => $mhs->tmpt_lahir,
            'tanggal_lahir' => $mhs->tgl_lahir,
            'agama' => $mhs->nm_agama,
            'kewarganegaraan' => $mhs->kewarganegaraan,
            'alamat' => [
                'jalan' => $mhs->jln,
                'rt' => $mhs->rt,
                'rw' => $mhs->rw,
                'desa_kelurahan' => $mhs->ds_kel,
                'kode_pos' => $mhs->kode_pos,
            ],
            'kontak' => [
                'telepon_rumah' => $mhs->no_tel_rmh,
                'no_hp' => $mhs->no_hp,
                'email' => $mhs->email,
            ],
            'akademik' => [
                'program_studi' => $mhs->nama_prodi,
                'jenjang' => $mhs->nama_jenjang,
                'status_mahasiswa' => $mhs->status_mahasiswa,
                'tanggal_masuk' => $mhs->tgl_masuk_sp,
            ],
        ];
    }

    /**
     * Get tendik detailed profile from SIKEP schema
     * Query pegawai first, then lookup reference tables separately with try-catch
     * (reference tables may not exist yet)
     */
    private function getTendikProfile($idUserSikep)
    {
        // Main query - only pegawai table (reference tables queried separately)
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

        $peg = $result[0];

        // Helper to trim and return null if empty
        $trimOrNull = function ($value) {
            if ($value === null) return null;
            $trimmed = trim($value);
            return $trimmed === '' ? null : $trimmed;
        };

        // Try to get golongan name from reference tables
        $golongan = null;
        $pangkat = null;
        if (!empty($peg->id_golongan)) {
            try {
                // Try PNS table first (uses id_gol, nm_gol, nm_pangkat)
                $golResult = DB::selectOne("
                    SELECT nm_gol AS golongan, nm_pangkat AS pangkat
                    FROM sikep.golongan_pns WITH(NOLOCK)
                    WHERE id_gol = ?
                ", [$peg->id_golongan]);

                if ($golResult) {
                    $golongan = $golResult->golongan;
                    $pangkat = $golResult->pangkat;
                } else {
                    // Try PPPK table (uses id, golongan, pangkat)
                    $golResult = DB::selectOne("
                        SELECT golongan, pangkat
                        FROM sikep.golongan_pppk WITH(NOLOCK)
                        WHERE id = ?
                    ", [$peg->id_golongan]);

                    if ($golResult) {
                        $golongan = $golResult->golongan;
                        $pangkat = $golResult->pangkat;
                    }
                }
            } catch (\Exception $e) {
                // Tables may not exist, use ID as fallback
                $golongan = $peg->id_golongan;
            }
        }

        // Try to get jabatan fungsional name
        $jabatanFungsional = null;
        if (!empty($peg->id_fungsional)) {
            try {
                $jfResult = DB::selectOne("
                    SELECT nm_jabfung FROM sikep.fungsional WITH(NOLOCK) WHERE id_jabfung = ?
                ", [$peg->id_fungsional]);
                $jabatanFungsional = $jfResult ? $jfResult->nm_jabfung : $peg->id_fungsional;
            } catch (\Exception $e) {
                $jabatanFungsional = $peg->id_fungsional;
            }
        }

        // Try to get jabatan struktural name
        $jabatanStruktural = null;
        if (!empty($peg->id_struktural)) {
            try {
                $jsResult = DB::selectOne("
                    SELECT nm_jabstruk FROM sikep.struktural WITH(NOLOCK) WHERE id_jabstruk = ?
                ", [$peg->id_struktural]);
                $jabatanStruktural = $jsResult ? $jsResult->nm_jabstruk : $peg->id_struktural;
            } catch (\Exception $e) {
                $jabatanStruktural = $peg->id_struktural;
            }
        }

        // Try to get pendidikan name
        $pendidikan = null;
        if (!empty($peg->id_pendidikan)) {
            try {
                $pendResult = DB::selectOne("
                    SELECT nm_pend FROM sikep.pendidikan WITH(NOLOCK) WHERE id_pend = ?
                ", [$peg->id_pendidikan]);
                $pendidikan = $pendResult ? $pendResult->nm_pend : $peg->id_pendidikan;
            } catch (\Exception $e) {
                $pendidikan = $peg->id_pendidikan;
            }
        }

        // Try to get unit kerja names from sikep.unit_orga
        $unitKerja1 = null;
        $unitKerja2 = null;
        $unitKerja3 = null;
        try {
            if (!empty($peg->id_org1)) {
                $org1Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$peg->id_org1]);
                $unitKerja1 = $org1Result ? $org1Result->nm_unit_orga : $peg->id_org1;
            }
            if (!empty($peg->id_org2)) {
                $org2Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$peg->id_org2]);
                $unitKerja2 = $org2Result ? $org2Result->nm_unit_orga : $peg->id_org2;
            }
            if (!empty($peg->id_org3)) {
                $org3Result = DB::selectOne("
                    SELECT nm_unit_orga FROM sikep.unit_orga WITH(NOLOCK) WHERE id_unit_orga = ?
                ", [$peg->id_org3]);
                $unitKerja3 = $org3Result ? $org3Result->nm_unit_orga : $peg->id_org3;
            }
        } catch (\Exception $e) {
            // Table sikep.unit_orga may not exist, use IDs as fallback
            $unitKerja1 = $peg->id_org1;
            $unitKerja2 = $peg->id_org2;
            $unitKerja3 = $peg->id_org3;
        }

        return [
            'id_pegawai' => $peg->id_pegawai,
            'nama' => $trimOrNull($peg->nm_pegawai),
            'nip' => $trimOrNull($peg->nip),
            'nidn' => $trimOrNull($peg->nidn),
            'jenis_kelamin' => $trimOrNull($peg->jk),
            'tempat_lahir' => $trimOrNull($peg->tmp_lahir),
            'tanggal_lahir' => $trimOrNull($peg->tgl_lahir),
            'alamat' => $trimOrNull($peg->alamat),
            'jenis_pegawai' => $trimOrNull($peg->jns_pegawai),
            'jenis_tenaga' => $trimOrNull($peg->jns_tenaga),
            'status' => $trimOrNull($peg->status),
            'kepegawaian' => [
                'tmt_cpns' => $trimOrNull($peg->tmt_cpns),
                'tmt_pns' => $trimOrNull($peg->tmt_pns),
                'tmt_pensiun' => $trimOrNull($peg->tmt_pensiun),
                'golongan' => $trimOrNull($golongan),
                'pangkat' => $trimOrNull($pangkat),
                'tmt_golongan' => $trimOrNull($peg->tmt_gol),
                'jabatan_fungsional' => $trimOrNull($jabatanFungsional),
                'tmt_fungsional' => $trimOrNull($peg->tmt_fung),
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
