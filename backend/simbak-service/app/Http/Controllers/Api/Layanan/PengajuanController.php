<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Repositories\PdutRepository;
use App\Repositories\Ref\KetentuanLayananRepository;
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
    protected KetentuanLayananRepository $ketentuanRepository;
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
        $this->pdutRepository = new PdutRepository();
        $this->ketentuanRepository = new KetentuanLayananRepository();
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
     * Mahasiswa: statistik agregat pengajuan saya.
     */
    public function myStats(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $stats = $this->repository->getMyStats($user->id_pengguna);
            return $this->successResponse($stats);
        } catch (\Exception $e) {
            Log::error('Pengajuan.myStats: ' . $e->getMessage());
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
                'id_smt_akhir_cuti' => 'nullable|string|max:10',
                'jumlah_semester_cuti' => 'nullable|integer|in:1,2',
                'kategori_cuti' => 'nullable|string|max:30',
                'kategori_undur' => 'nullable|string|max:30',
                'nm_pt_tujuan' => 'nullable|string|max:200',
                'id_prodi_tujuan' => 'nullable|uuid',
                'id_fakultas_tujuan' => 'nullable|uuid',
                'a_dari_luar' => 'nullable|boolean',
                'nomor_surat_polisi' => 'nullable|string|max:100',
                'tgl_surat_polisi' => 'nullable|date',
                'nomor_surat_ket_aktif' => 'nullable|string|max:100',
                'tgl_surat_ket_aktif' => 'nullable|date',
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
                    if (empty($data['kategori_cuti'])) {
                        $data['kategori_cuti'] = 'terencana';
                    }
                    if (empty($data['id_smt_mulai_cuti'])) {
                        return $this->errorResponse('Semester mulai cuti wajib dipilih', 422);
                    }
                    if (empty($data['jumlah_semester_cuti'])) {
                        return $this->errorResponse('Jumlah semester cuti wajib diisi (1 atau 2)', 422);
                    }
                    if (empty($data['id_smt_akhir_cuti'])) {
                        return $this->errorResponse('Semester akhir cuti wajib diisi', 422);
                    }
                    // Validasi konsistensi: hitung akhir dari mulai + jumlah
                    $expectedAkhir = $this->computeSemesterAkhir($data['id_smt_mulai_cuti'], (int) $data['jumlah_semester_cuti']);
                    if ($expectedAkhir && $data['id_smt_akhir_cuti'] !== $expectedAkhir) {
                        return $this->errorResponse('Semester akhir cuti tidak sesuai dengan semester mulai dan jumlah semester', 422);
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

                        // Blokade mahasiswa pascasarjana
                        if (in_array($jenjang, ['s2', 's3', 'magister', 'doktor'])) {
                            return $this->errorResponse(
                                'Mahasiswa Pascasarjana tidak dapat mengajukan Alih Program.',
                                422
                            );
                        }

                        // Validasi hierarki jenjang prodi tujuan
                        $jenjangTujuan = strtolower($this->repository->getJenjangProdi($data['id_prodi_tujuan']) ?? '');
                        $allowedTujuan = match (true) {
                            in_array($jenjang, ['d3', 'diploma']) => ['d3', 'diploma'],
                            in_array($jenjang, ['s1', 'sarjana']) => ['d3', 'diploma', 's1', 'sarjana'],
                            default => [],
                        };
                        if ($jenjangTujuan && !in_array($jenjangTujuan, $allowedTujuan)) {
                            $jenjangAsalLabel = strtoupper($jenjang);
                            $allowedLabel = $jenjang === 's1' || $jenjang === 'sarjana' ? 'D3 atau S1' : 'D3';
                            return $this->errorResponse(
                                "Mahasiswa jenjang {$jenjangAsalLabel} hanya boleh memilih prodi tujuan jenjang {$allowedLabel}.",
                                422
                            );
                        }

                        // Validasi syarat akademik dinamis dari ref.ketentuan_layanan
                        $errors = $this->validateAcademicRules(
                            $jenisLayanan->id_jenis_layanan,
                            $jenjang,
                            ['ipk' => $ipk, 'sks' => $sks, 'semester' => $semester]
                        );

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
                    if (empty($data['kategori_undur'])) {
                        $data['kategori_undur'] = 'undur_diri';
                    }
                    if ($data['kategori_undur'] === 'pindah_pt' && empty($data['nm_pt_tujuan'])) {
                        return $this->errorResponse('Nama perguruan tinggi tujuan wajib diisi untuk kategori pindah PT', 422);
                    }
                }

                // SK-PKKMB & SK-KTM: wajib nomor surat polisi + nomor surat keterangan aktif
                if (in_array($jenisLayanan->kode_layanan, ['SK-PKKMB', 'SK-KTM'])) {
                    if (empty($data['nomor_surat_polisi'])) {
                        return $this->errorResponse('Nomor Surat Kehilangan dari Kepolisian wajib diisi', 422);
                    }
                    if (empty($data['nomor_surat_ket_aktif'])) {
                        return $this->errorResponse('Nomor Surat Keterangan Mahasiswa Aktif dari Fakultas wajib diisi', 422);
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
     * Pendaftaran PM-ALIH eksternal (calon mahasiswa dari luar Unila).
     * Khusus admin BAK / admin fakultas — input atas nama pemohon yang mendaftar manual.
     *
     * Mendukung upload dokumen via multipart/form-data (key: dokumen[0], dokumen[1], dst).
     * Setelah create + upload, status langsung di-set ke 'diajukan' (skip draft).
     */
    public function storeEksternal(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                // Data pemohon
                'nm_mahasiswa' => 'required|string|max:200',
                'nim_asal' => 'required|string|max:20',
                'nm_pt_asal' => 'required|string|max:200',
                'nm_prodi_asal' => 'nullable|string|max:200',
                'nm_jenjang_asal' => 'required|string|max:50',
                'akreditasi_prodi_asal' => 'nullable|string|max:50',
                'tempat_lahir' => 'nullable|string|max:100',
                'tgl_lahir' => 'nullable|date',
                'jenis_kelamin' => 'nullable|string|in:L,P',
                'ipk' => 'nullable|numeric|min:0|max:4',
                'sks_lulus' => 'nullable|integer|min:0',
                'semester_aktif' => 'nullable|integer|min:1',
                // Kontak (untuk notifikasi karena calon tidak punya SSO)
                'email_pemohon' => 'required|email|max:150',
                'no_hp_pemohon' => 'required|string|max:30',
                // Tujuan
                'id_prodi_tujuan' => 'required|uuid',
                'id_fakultas_tujuan' => 'required|uuid',
                // Catatan
                'alasan' => 'nullable|string',
                'catatan_pemohon' => 'nullable|string',
                // SK Dekan (hasil verifikasi & penerimaan fakultas tujuan)
                'nomor_sk_dekan' => 'required|string|max:100',
                'tgl_sk_dekan' => 'required|date',
                'file_sk_dekan' => 'required|file|mimes:pdf|max:20480',
                'catatan_verifikasi' => 'nullable|string',
                // Dokumen pendukung lainnya (transkrip, dll)
                'dokumen' => 'nullable|array',
                'dokumen.*' => 'file|max:20480',
            ]);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');
            if ($jenisLayanan->kode_layanan !== 'PM-ALIH') {
                return $this->errorResponse('Pendaftaran eksternal hanya berlaku untuk Alih Program (PM-ALIH)', 422);
            }

            // Validasi jenjang asal: blokade Pascasarjana
            $jenjangAsal = strtolower($data['nm_jenjang_asal']);
            if (in_array($jenjangAsal, ['s2', 's3', 'magister', 'doktor'])) {
                return $this->errorResponse(
                    'Pendaftaran Alih Program tidak tersedia untuk jenjang Pascasarjana.',
                    422
                );
            }

            // Validasi hierarki jenjang tujuan
            $jenjangTujuan = strtolower($this->repository->getJenjangProdi($data['id_prodi_tujuan']) ?? '');
            $allowedTujuan = match (true) {
                in_array($jenjangAsal, ['d3', 'diploma']) => ['d3', 'diploma'],
                in_array($jenjangAsal, ['s1', 'sarjana']) => ['d3', 'diploma', 's1', 'sarjana'],
                default => [],
            };
            if ($jenjangTujuan && !in_array($jenjangTujuan, $allowedTujuan)) {
                $allowedLabel = in_array($jenjangAsal, ['s1', 'sarjana']) ? 'D3 atau S1' : 'D3';
                return $this->errorResponse(
                    "Calon mahasiswa jenjang " . strtoupper($jenjangAsal) . " hanya boleh memilih prodi tujuan jenjang {$allowedLabel}.",
                    422
                );
            }

            // Validasi syarat akademik dinamis (jika data IPK/SKS/semester diisi)
            if (!empty($data['ipk']) || !empty($data['sks_lulus']) || !empty($data['semester_aktif'])) {
                $errors = $this->validateAcademicRules(
                    $jenisLayanan->id_jenis_layanan,
                    $jenjangAsal,
                    [
                        'ipk' => $data['ipk'] ?? 0,
                        'sks' => $data['sks_lulus'] ?? 0,
                        'semester' => $data['semester_aktif'] ?? 0,
                    ]
                );
                if (!empty($errors)) {
                    return $this->errorResponse(
                        "Calon belum memenuhi syarat Alih Program: " . implode('; ', $errors),
                        422
                    );
                }
            }

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Create pengajuan dengan status diperiksa_fakultas (skip tahap 1, 2, 3 — admin fakultas sekaligus verifikasi)
            $pengajuanData = [
                'id_jenis_layanan' => $data['id_jenis_layanan'],
                'nomor_permohonan' => $this->repository->generateNomor($jenisLayanan->kode_layanan),
                'id_pemohon' => null,
                'a_dari_luar' => true,
                'nm_pt_asal' => $data['nm_pt_asal'],
                'alasan' => $data['alasan'] ?? null,
                'catatan_pemohon' => $data['catatan_pemohon'] ?? null,
                'id_prodi_tujuan' => $data['id_prodi_tujuan'],
                'id_fakultas_tujuan' => $data['id_fakultas_tujuan'],
                'status' => 'diperiksa_fakultas',
                'tgl_diajukan' => date('Y-m-d H:i:s'),
                'id_creator' => $user->id_pengguna,
            ];
            $pengajuan = $this->repository->create($pengajuanData);

            // Snapshot data_pemohon eksternal
            $this->repository->createDataPemohon([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'id_mahasiswa' => null,
                'nim' => $data['nim_asal'],
                'nm_mahasiswa' => $data['nm_mahasiswa'],
                'tempat_lahir' => $data['tempat_lahir'] ?? null,
                'tgl_lahir' => $data['tgl_lahir'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                'nm_prodi' => $data['nm_prodi_asal'] ?? null,
                'nm_jenjang' => $data['nm_jenjang_asal'],
                'nm_jenjang_asal' => $data['nm_jenjang_asal'],
                'nm_prodi_asal' => $data['nm_prodi_asal'] ?? null,
                'ipk' => $data['ipk'] ?? null,
                'sks_lulus' => $data['sks_lulus'] ?? null,
                'semester_aktif' => $data['semester_aktif'] ?? null,
                'nm_pt_asal' => $data['nm_pt_asal'],
                'akreditasi_prodi_asal' => $data['akreditasi_prodi_asal'] ?? null,
                'email_pemohon' => $data['email_pemohon'],
                'no_hp_pemohon' => $data['no_hp_pemohon'],
                'id_creator' => $user->id_pengguna,
            ]);

            // Upload SK Dekan (wajib untuk PM-ALIH eksternal)
            $fileSk = $request->file('file_sk_dekan');
            $pathSk = $this->minioService->uploadDokumenPengajuan(
                $pengajuan->id_pengajuan,
                'SK-DEKAN',
                $fileSk
            );
            $this->repository->createDokumen([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'nm_dokumen' => 'SK Dekan',
                'nama_file_asli' => $fileSk->getClientOriginalName(),
                'path_file' => $pathSk,
                'tipe_file' => $fileSk->getMimeType(),
                'ukuran_byte' => $fileSk->getSize(),
                'id_pengunggah' => $user->id_pengguna,
                'nomor_dokumen' => $data['nomor_sk_dekan'],
                'tgl_dokumen' => $data['tgl_sk_dekan'],
                'keterangan' => 'SK Dekan tentang penerimaan calon alih program eksternal',
                'id_creator' => $user->id_pengguna,
            ]);

            // Upload dokumen pendukung lainnya
            if ($request->hasFile('dokumen')) {
                foreach ($request->file('dokumen') as $idx => $file) {
                    $namaDokumen = $request->input("dokumen_nm.{$idx}", $file->getClientOriginalName());
                    $kodeDokumen = $request->input("dokumen_kode.{$idx}", 'EKSTERNAL');
                    $pathFile = $this->minioService->uploadDokumenPengajuan($pengajuan->id_pengajuan, $kodeDokumen, $file);

                    $this->repository->createDokumen([
                        'id_pengajuan' => $pengajuan->id_pengajuan,
                        'id_persyaratan' => $request->input("dokumen_persyaratan.{$idx}"),
                        'nm_dokumen' => $namaDokumen,
                        'nama_file_asli' => $file->getClientOriginalName(),
                        'path_file' => $pathFile,
                        'tipe_file' => $file->getMimeType(),
                        'ukuran_byte' => $file->getSize(),
                        'id_pengunggah' => $user->id_pengguna,
                        'id_creator' => $user->id_pengguna,
                    ]);
                }
            }

            // Riwayat: gabungan Pendaftaran + Verifikasi Fakultas Tujuan + SK Dekan
            // Sekaligus mewakili tahap 1, 2, 3 untuk pengajuan eksternal
            $catatanRiwayat = "Pendaftaran calon dari {$data['nm_pt_asal']} sekaligus verifikasi & penerbitan SK Dekan No. {$data['nomor_sk_dekan']}";
            if (!empty($data['catatan_verifikasi'])) {
                $catatanRiwayat .= '. Catatan: ' . $data['catatan_verifikasi'];
            }
            $this->repository->createRiwayat([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'urutan' => 1,
                'nm_tahapan' => 'Verifikasi & Penerimaan Fakultas Tujuan',
                'status_dari' => '',
                'status_ke' => 'diperiksa_fakultas',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'admin_fakultas',
                'catatan' => $catatanRiwayat,
            ]);

            $this->repository->pgCommit();

            return $this->createdResponse($pengajuan, 'Pendaftaran PM-ALIH eksternal berhasil dibuat');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Pengajuan.storeEksternal: ' . $e->getMessage());
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
     * Cek KRS aktif mahasiswa pada semester tertentu (untuk validasi cuti tidak terencana).
     */
    public function cekKrs(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $pemohon = $this->repository->getDataPemohon($id);
            if (!$pemohon || empty($pemohon->nim)) {
                return $this->successResponse(['ada_krs' => false, 'message' => 'Data pemohon tidak ditemukan']);
            }

            $idSmt = $pengajuan->id_smt_mulai_cuti;
            if (empty($idSmt)) {
                return $this->successResponse(['ada_krs' => false, 'message' => 'Semester cuti belum ditentukan']);
            }

            $krs = $this->pdutRepository->getKrsAktif($pemohon->nim, $idSmt);

            if ($krs && $krs['ada_krs']) {
                return $this->successResponse([
                    'ada_krs' => true,
                    'nim' => $pemohon->nim,
                    'id_smt' => $idSmt,
                    'sks_semester' => $krs['sks_semester'],
                    'message' => "Mahasiswa memiliki KRS aktif pada semester ini ({$krs['sks_semester']} SKS). Pastikan KRS sudah dihapus melalui SIAKAD sebelum memproses cuti.",
                ]);
            }

            return $this->successResponse(['ada_krs' => false, 'message' => 'Tidak ditemukan KRS aktif']);
        } catch (\Exception $e) {
            Log::error('Pengajuan.cekKrs: ' . $e->getMessage());
            return $this->successResponse(['ada_krs' => false, 'message' => 'Gagal mengecek KRS']);
        }
    }

    public function riwayatCuti(string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $simbak = [];
            if ($pengajuan->id_pemohon) {
                $simbak = $this->repository->getRiwayatCutiByPemohon($pengajuan->id_pemohon, $id);
            }

            $pdut = [];
            $pemohon = $this->repository->getDataPemohon($id);
            if ($pemohon && !empty($pemohon->nim)) {
                $pdut = $this->pdutRepository->getRiwayatCutiSiakad($pemohon->nim);
            }

            $totalSimbak = 0;
            foreach ($simbak as $item) {
                if ($item->status === 'terbit' && $item->jumlah_semester_cuti) {
                    $totalSimbak += (int) $item->jumlah_semester_cuti;
                }
            }
            $totalPdut = count($pdut);
            $total = $totalSimbak + $totalPdut;

            return $this->successResponse([
                'simbak' => $simbak,
                'pdut' => $pdut,
                'total_semester_cuti' => $total,
            ]);
        } catch (\Exception $e) {
            Log::error('Pengajuan.riwayatCuti: ' . $e->getMessage());
            return $this->successResponse(['simbak' => [], 'pdut' => [], 'total_semester_cuti' => 0]);
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

    /**
     * Validasi syarat akademik dinamis dari ref.ketentuan_layanan.
     * Return: array pesan error (empty = lolos).
     */
    private function validateAcademicRules(string $idJenisLayanan, string $jenjang, array $values): array
    {
        $rules = $this->ketentuanRepository->getByJenisLayanan($idJenisLayanan);
        if (empty($rules)) return [];

        $jenjangNorm = match (strtolower($jenjang)) {
            's1', 'sarjana' => 'S1',
            'd3', 'diploma' => 'D3',
            's2', 'magister' => 'S2',
            's3', 'doktor' => 'S3',
            default => strtoupper($jenjang),
        };

        $errors = [];
        foreach ($rules as $rule) {
            if ($rule->nm_jenjang && strtoupper($rule->nm_jenjang) !== $jenjangNorm) continue;

            $actual = match ($rule->kode_ketentuan) {
                'ipk_min' => (float) ($values['ipk'] ?? 0),
                'sks_min' => (int) ($values['sks'] ?? 0),
                'semester_max' => (int) ($values['semester'] ?? 0),
                'masa_studi_min' => (int) ($values['semester'] ?? 0),
                default => null,
            };
            if ($actual === null) continue;

            $expected = (float) $rule->nilai;
            $pass = match ($rule->operator) {
                '>=' => $actual >= $expected,
                '>'  => $actual >  $expected,
                '<=' => $actual <= $expected,
                '<'  => $actual <  $expected,
                '='  => $actual == $expected,
                '!=' => $actual != $expected,
                default => true,
            };

            if (!$pass) {
                $label = $rule->pesan_gagal ?: "{$rule->nm_ketentuan} {$rule->operator} {$rule->nilai}";
                $unit = in_array($rule->kode_ketentuan, ['sks_min']) ? '' : '';
                $errors[] = "{$label} (Anda: {$actual}{$unit})";
            }
        }
        return $errors;
    }

    private function computeSemesterAkhir(string $idSmtMulai, int $jumlah): ?string
    {
        if (strlen($idSmtMulai) < 5) return null;
        $year = (int) substr($idSmtMulai, 0, 4);
        $sem = (int) substr($idSmtMulai, 4, 1);
        if ($sem < 1 || $sem > 2) return null;

        for ($i = 1; $i < $jumlah; $i++) {
            if ($sem === 1) { $sem = 2; } else { $sem = 1; $year++; }
        }

        return $year . $sem;
    }
}
