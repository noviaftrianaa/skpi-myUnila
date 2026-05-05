<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Repositories\PdutRepository;
use App\Services\MinioService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PengajuanController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;
    protected JenisLayananRepository $jenisLayananRepo;
    protected PdutRepository $pdutRepository;
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
        $this->pdutRepository = new PdutRepository();
        $this->minioService = new MinioService();
    }

    /**
     * Admin: list semua pengajuan.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'status' => $request->get('status'),
                'kode_layanan' => $request->get('kode_layanan'),
                'nm_fakultas' => $request->get('nm_fakultas'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Pengajuan.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Mahasiswa: list pengajuan saya.
     */
    public function myPengajuan(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'status' => $request->get('status'),
            ];
            $result = $this->repository->getMyPengajuan($user->id_pengguna, $params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Pengajuan.myPengajuan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Create pengajuan baru.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $isDariLuar = $request->boolean('a_dari_luar', false);

            $baseRules = [
                'id_jenis_layanan' => 'required|uuid',
                'alasan' => 'nullable|string',
                'catatan_pemohon' => 'nullable|string',
                'id_smt_mulai_cuti' => 'nullable|string|max:10',
                'jumlah_semester_cuti' => 'nullable|integer|in:1,2',
                'id_prodi_tujuan' => 'nullable|uuid',
                'id_fakultas_tujuan' => 'nullable|uuid',
                'a_dari_luar' => 'nullable|boolean',
            ];

            // Validasi tambahan untuk pengajuan dari luar Unila
            if ($isDariLuar) {
                $baseRules = array_merge($baseRules, [
                    'nm_pt_asal' => 'required|string|max:200',
                    'nm_mahasiswa' => 'required|string|max:200',
                    'nim_asal' => 'required|string|max:20',
                    'nm_prodi_asal' => 'nullable|string|max:200',
                    'nm_jenjang' => 'nullable|string|max:50',
                    'akreditasi_prodi_asal' => 'nullable|string|max:50',
                    'tempat_lahir' => 'nullable|string|max:100',
                    'tgl_lahir' => 'nullable|date',
                    'jenis_kelamin' => 'nullable|string|in:L,P',
                    'ipk' => 'nullable|numeric|min:0|max:4',
                    'sks_lulus' => 'nullable|integer|min:0',
                    'semester_aktif' => 'nullable|integer|min:1',
                ]);
            }

            $data = $request->validate($baseRules);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');

            // PM-ALIH dari luar Unila: hanya berlaku untuk ALIH_PROGRAM
            if ($isDariLuar && $jenisLayanan->kode_layanan !== 'PM-ALIH') {
                return $this->errorResponse('Flag "dari luar Unila" hanya berlaku untuk layanan Alih Program', 422);
            }

            // Cek duplikat — skip untuk pengajuan dari luar (tidak ada id_pemohon mahasiswa)
            if (!$isDariLuar) {
                $existing = $this->repository->pgSelectOne("
                    SELECT id_pengajuan, nomor_permohonan, status
                    FROM layanan.pengajuan
                    WHERE id_pemohon = ? AND id_jenis_layanan = ?
                      AND status NOT IN ('terbit', 'ditolak')
                      AND soft_delete = false
                    ORDER BY created_at DESC
                ", [$user->id_pengguna, $data['id_jenis_layanan']]);

                if ($existing) {
                    $statusLabel = [
                        'draft' => 'draft', 'diajukan' => 'sedang diverifikasi',
                        'perlu_perbaikan' => 'menunggu perbaikan', 'diverifikasi' => 'sedang diproses',
                        'menunggu_persetujuan' => 'menunggu persetujuan', 'disetujui' => 'menunggu penerbitan',
                    ];
                    $label = $statusLabel[$existing->status] ?? $existing->status;
                    return $this->errorResponse(
                        "Anda sudah memiliki pengajuan {$jenisLayanan->nm_layanan} yang masih {$label} (No. {$existing->nomor_permohonan}). Selesaikan atau hapus pengajuan tersebut sebelum membuat yang baru.",
                        422
                    );
                }
            }

            // Validasi khusus per jenis layanan (hanya untuk pengajuan internal/mahasiswa)
            $nim = $user->username ?? '';
            $pdutData = !$isDariLuar ? $this->pdutRepository->getStudentByNim($nim) : null;

            if (!$isDariLuar) {
                if ($pdutData && $jenisLayanan->kode_layanan === 'SK-HERREG') {
                    $statusReg = strtolower($pdutData['status_registrasi'] ?? '');
                    if ($statusReg && !in_array($statusReg, ['aktif', 'active', 'a'])) {
                        return $this->errorResponse(
                            "Pengajuan Surat Herregistrasi ditolak: status registrasi Anda saat ini adalah \"{$pdutData['status_registrasi']}\". Layanan ini hanya untuk mahasiswa yang sudah herregistrasi pada semester berjalan.",
                            422
                        );
                    }
                }

                if ($jenisLayanan->kode_layanan === 'PM-CUTI') {
                    if (empty($data['jumlah_semester_cuti'])) {
                        return $this->errorResponse('Jumlah semester cuti wajib diisi (1 atau 2)', 422);
                    }
                    if ($pdutData && !empty($pdutData['semester_aktif']) && (int)$pdutData['semester_aktif'] <= 1) {
                        return $this->errorResponse('Cuti akademik tidak dapat diajukan pada semester 1', 422);
                    }
                }

                if ($jenisLayanan->kode_layanan === 'PM-ALIH') {
                    if (empty($data['id_prodi_tujuan']) || empty($data['id_fakultas_tujuan'])) {
                        return $this->errorResponse('Program studi tujuan dan fakultas tujuan wajib dipilih', 422);
                    }
                    if ($pdutData) {
                        $ipk = (float) ($pdutData['ipk'] ?? 0);
                        $sks = (int) ($pdutData['sks_lulus'] ?? 0);
                        $semester = (int) ($pdutData['semester_aktif'] ?? 0);
                        $jenjang = strtolower($pdutData['nm_jenjang'] ?? '');

                        $errors = [];
                        if (in_array($jenjang, ['s1', 'sarjana'])) {
                            if ($ipk < 2.75) $errors[] = "IPK minimal 2.75 (IPK Anda: {$ipk})";
                            if ($sks < 40) $errors[] = "SKS lulus minimal 40 (SKS Anda: {$sks})";
                            if ($semester > 5) $errors[] = "Maksimal semester 5 (semester Anda: {$semester})";
                        } elseif (in_array($jenjang, ['d3', 'diploma'])) {
                            if ($ipk < 2.50) $errors[] = "IPK minimal 2.50 (IPK Anda: {$ipk})";
                            if ($sks < 36) $errors[] = "SKS lulus minimal 36 (SKS Anda: {$sks})";
                            if ($semester > 5) $errors[] = "Maksimal semester 5 (semester Anda: {$semester})";
                        } elseif (in_array($jenjang, ['s2', 's3', 'magister', 'doktor'])) {
                            if ($ipk < 3.00) $errors[] = "IPK minimal 3.00 (IPK Anda: {$ipk})";
                            if ($sks < 12) $errors[] = "SKS lulus minimal 12 (SKS Anda: {$sks})";
                            if ($semester > 3) $errors[] = "Maksimal semester 3 (semester Anda: {$semester})";
                        }

                        if (!empty($errors)) {
                            return $this->errorResponse(
                                "Anda belum memenuhi syarat Alih Program: " . implode('; ', $errors),
                                422
                            );
                        }
                    }
                }

                if ($jenisLayanan->kode_layanan === 'PM-UNDUR') {
                    if (empty($data['alasan'])) {
                        return $this->errorResponse('Alasan pengunduran diri wajib diisi', 422);
                    }
                }
            } else {
                // Dari luar Unila: wajib prodi tujuan
                if (empty($data['id_prodi_tujuan']) || empty($data['id_fakultas_tujuan'])) {
                    return $this->errorResponse('Program studi tujuan dan fakultas tujuan wajib dipilih', 422);
                }
            }

            // Generate nomor
            $data['nomor_permohonan'] = $this->repository->generateNomor($jenisLayanan->kode_layanan);
            $data['id_pemohon'] = $isDariLuar ? null : $user->id_pengguna;
            $data['status'] = 'draft';
            $data['id_creator'] = $user->id_pengguna;
            if ($isDariLuar) {
                $data['a_dari_luar'] = true;
                $data['nm_pt_asal'] = $data['nm_pt_asal'] ?? null;
            }

            // Begin transaction
            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Race condition check — skip for dari luar (no id_pemohon to check)
            if (!$isDariLuar) {
                $existingLocked = $this->repository->pgSelectOne("
                    SELECT id_pengajuan FROM layanan.pengajuan
                    WHERE id_pemohon = ? AND id_jenis_layanan = ?
                      AND status NOT IN ('terbit', 'ditolak') AND soft_delete = false
                    FOR UPDATE
                ", [$user->id_pengguna, $data['id_jenis_layanan']]);

                if ($existingLocked) {
                    $this->repository->pgRollback();
                    return $this->errorResponse('Pengajuan sedang diproses, silakan coba lagi', 409);
                }
            }

            // Create pengajuan
            $pengajuan = $this->repository->create($data);

            // Create data pemohon snapshot
            if ($isDariLuar) {
                // Data dari input manual admin (bukan dari PDUT)
                $dataPemohon = [
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'id_mahasiswa' => null,
                    'nim' => $data['nim_asal'] ?? null,
                    'nm_mahasiswa' => $data['nm_mahasiswa'] ?? '',
                    'tempat_lahir' => $data['tempat_lahir'] ?? null,
                    'tgl_lahir' => $data['tgl_lahir'] ?? null,
                    'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                    'nm_prodi' => $data['nm_prodi_asal'] ?? null,
                    'nm_jenjang' => $data['nm_jenjang'] ?? null,
                    'ipk' => $data['ipk'] ?? null,
                    'sks_lulus' => $data['sks_lulus'] ?? null,
                    'semester_aktif' => $data['semester_aktif'] ?? null,
                    'nm_pt_asal' => $data['nm_pt_asal'] ?? null,
                    'akreditasi_prodi_asal' => $data['akreditasi_prodi_asal'] ?? null,
                    'id_creator' => $user->id_pengguna,
                ];
            } else {
                // Enrich dari PDUT (SQL Server) — existing flow
                $pdutData = $this->pdutRepository->getStudentByNim($nim);

                $dataPemohon = [
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'id_mahasiswa' => $user->id_pengguna,
                    'nim' => $nim,
                    'nm_mahasiswa' => $user->nm_pengguna ?? $user->nama ?? '',
                    'id_creator' => $user->id_pengguna,
                ];

                if ($pdutData) {
                    $dataPemohon = array_merge($dataPemohon, [
                        'nm_mahasiswa' => $pdutData['nm_mahasiswa'] ?? $dataPemohon['nm_mahasiswa'],
                        'tempat_lahir' => $pdutData['tempat_lahir'] ?? null,
                        'tgl_lahir' => $pdutData['tgl_lahir'] ?? null,
                        'jenis_kelamin' => $pdutData['jenis_kelamin'] ?? null,
                        'id_fakultas' => $pdutData['id_fakultas'] ?? null,
                        'nm_fakultas' => $pdutData['nm_fakultas'] ?? null,
                        'id_prodi' => $pdutData['id_prodi'] ?? null,
                        'nm_prodi' => $pdutData['nm_prodi'] ?? null,
                        'id_jenj_didik' => $pdutData['id_jenj_didik'] ?? null,
                        'nm_jenjang' => $pdutData['nm_jenjang'] ?? null,
                        'angkatan' => $pdutData['angkatan'] ?? null,
                        'semester_aktif' => $pdutData['semester_aktif'] ?? null,
                        'id_smt' => $pdutData['id_smt'] ?? null,
                        'ipk' => $pdutData['ipk'] ?? null,
                        'sks_lulus' => $pdutData['sks_lulus'] ?? null,
                        'masa_studi_semester' => $pdutData['masa_studi_semester'] ?? null,
                        'status_mahasiswa' => $pdutData['status_registrasi'] ?? null,
                        'status_registrasi' => $pdutData['status_registrasi'] ?? null,
                        'status_pembayaran' => $pdutData['status_pembayaran'] ?? null,
                    ]);
                } else {
                    Log::warning("PDUT enrichment gagal untuk NIM: {$nim} — data_pemohon disimpan dengan data minimal");
                }
            }

            $this->repository->createDataPemohon($dataPemohon);

            // Create riwayat: draft
            $this->repository->createRiwayat([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'urutan' => 1,
                'nm_tahapan' => 'Pengajuan dibuat',
                'status_dari' => '',
                'status_ke' => 'draft',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $isDariLuar ? 'admin_bak' : 'mahasiswa',
            ]);

            $this->repository->pgCommit();

            return $this->createdResponse($pengajuan, 'Pengajuan berhasil dibuat');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Pengajuan.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Detail pengajuan.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $result = (array) $pengajuan;
            $result['data_pemohon'] = $this->repository->getDataPemohon($id);
            $result['dokumen'] = $this->repository->getDokumen($id);
            $result['riwayat'] = $this->repository->getRiwayat($id);
            $result['persetujuan'] = $this->repository->getPersetujuan($id);
            $result['dokumen_hasil'] = $this->repository->getDokumenHasil($id);

            return $this->successResponse($result);
        } catch (\Exception $e) {
            Log::error('Pengajuan.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    // =========================================
    // Referensi dari PDUT (untuk dropdown)
    // =========================================

    public function refFakultas(): JsonResponse
    {
        try {
            $data = $this->pdutRepository->getFakultasList();
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Pengajuan.refFakultas: ' . $e->getMessage());
            return $this->successResponse([]);
        }
    }

    public function refProdi(Request $request): JsonResponse
    {
        try {
            $idFakultas = $request->get('id_fakultas');
            $data = $this->pdutRepository->getProdiByFakultas($idFakultas);
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Pengajuan.refProdi: ' . $e->getMessage());
            return $this->successResponse([]);
        }
    }

    public function refSemester(): JsonResponse
    {
        try {
            $data = $this->pdutRepository->getSemesterList(20);
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Pengajuan.refSemester: ' . $e->getMessage());
            return $this->successResponse([]);
        }
    }

    /**
     * Upload dokumen persyaratan.
     */
    public function uploadDokumen(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $request->validate([
                'file' => 'required|file|max:10240', // 10MB
                'nm_dokumen' => 'required|string|max:200',
                'id_persyaratan' => 'nullable|uuid',
            ]);

            $user = $request->user();
            $file = $request->file('file');

            // Upload ke MinIO
            $kodeDokumen = $request->get('id_persyaratan', 'general');
            $path = $this->minioService->uploadDokumenPengajuan($id, $kodeDokumen, $file);

            $dokumen = $this->repository->createDokumen([
                'id_pengajuan' => $id,
                'id_persyaratan' => $request->get('id_persyaratan'),
                'nm_dokumen' => $request->get('nm_dokumen'),
                'nama_file_asli' => $file->getClientOriginalName(),
                'path_file' => $path,
                'tipe_file' => $file->getMimeType(),
                'ukuran_byte' => $file->getSize(),
                'id_pengunggah' => $user->id_pengguna,
                'id_creator' => $user->id_pengguna,
            ]);

            return $this->createdResponse($dokumen, 'Dokumen berhasil diupload');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Pengajuan.uploadDokumen: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Hapus pengajuan draft beserta semua dokumen yang sudah diupload.
     * Hanya bisa dihapus jika status masih draft dan oleh pemohon sendiri.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            if ($pengajuan->status !== 'draft') {
                return $this->errorResponse('Hanya pengajuan berstatus draft yang dapat dihapus', 422);
            }

            $user = $request->user();
            if ($pengajuan->id_pemohon !== $user->id_pengguna) {
                return $this->errorResponse('Anda tidak memiliki akses untuk menghapus pengajuan ini', 403);
            }

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Hapus file dokumen dari storage
            $dokumenList = $this->repository->getDokumen($id);
            foreach ($dokumenList as $doc) {
                if (!empty($doc->path_file)) {
                    try { $this->minioService->delete($doc->path_file); } catch (\Exception $e) {
                        Log::warning("Gagal hapus file: {$doc->path_file} — {$e->getMessage()}");
                    }
                }
            }

            // Soft delete semua data terkait
            $this->repository->pgUpdate("UPDATE layanan.dokumen_pengajuan SET soft_delete = true WHERE id_pengajuan = ?", [$id]);
            $this->repository->pgUpdate("UPDATE layanan.riwayat_pengajuan SET soft_delete = true WHERE id_pengajuan = ?", [$id]);
            $this->repository->pgUpdate("UPDATE layanan.data_pemohon SET soft_delete = true WHERE id_pengajuan = ?", [$id]);
            $this->repository->pgUpdate("UPDATE layanan.pengajuan SET soft_delete = true, id_updater = ? WHERE id_pengajuan = ?", [$user->id_pengguna, $id]);

            $this->repository->pgCommit();

            return $this->successResponse(null, 'Pengajuan draft berhasil dihapus');
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Pengajuan.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Preview data akademik mahasiswa dari PDUT (sebelum submit pengajuan).
     */
    public function myProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $nim = $user->username ?? '';

            $pdutData = $this->pdutRepository->getStudentByNim($nim);

            if (!$pdutData) {
                return $this->successResponse([
                    'nim' => $nim,
                    'nm_mahasiswa' => $user->nm_pengguna ?? $user->nama ?? '',
                    '_pdut_connected' => false,
                    '_message' => 'Data akademik tidak tersedia dari sistem PDUT',
                ]);
            }

            $pdutData['_pdut_connected'] = true;
            return $this->successResponse($pdutData);
        } catch (\Exception $e) {
            Log::error('Pengajuan.myProfile: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Ajukan pengajuan (draft → diajukan).
     */
    public function ajukan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if (!in_array($pengajuan->status, ['draft', 'perlu_perbaikan'])) {
                return $this->errorResponse('Pengajuan tidak dalam status yang bisa diajukan', 422);
            }

            // Cek dokumen wajib sudah diupload
            $dokumen = $this->repository->getDokumen($id);
            $jenisLayanan = $this->jenisLayananRepo->findById($pengajuan->id_jenis_layanan);
            if ($jenisLayanan) {
                $persyaratanWajib = $this->repository->pgSelect(
                    "SELECT id_persyaratan, nm_dokumen FROM ref.persyaratan_layanan WHERE id_jenis_layanan = ? AND a_wajib = true AND soft_delete = false",
                    [$pengajuan->id_jenis_layanan]
                );
                foreach ($persyaratanWajib as $req) {
                    $found = false;
                    foreach ($dokumen as $doc) {
                        if ($doc->id_persyaratan === $req->id_persyaratan) { $found = true; break; }
                    }
                    if (!$found) {
                        return $this->errorResponse("Dokumen wajib \"{$req->nm_dokumen}\" belum diupload", 422);
                    }
                }
            }

            $user = $request->user();
            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $statusDari = $pengajuan->status;
            // Update status dengan expected status (race condition protection)
            $updated = $this->repository->updateStatus($id, 'diajukan', $user->id_pengguna, $pengajuan->status);
            if (!$updated) {
                $this->repository->pgRollback();
                return $this->errorResponse('Status pengajuan sudah berubah. Silakan refresh halaman.', 409);
            }

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => 'Pengajuan diajukan',
                'status_dari' => $statusDari,
                'status_ke' => 'diajukan',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'mahasiswa',
            ]);

            $this->repository->pgCommit();

            return $this->successResponse(null, 'Pengajuan berhasil diajukan');
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Pengajuan.ajukan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
