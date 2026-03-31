<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Repositories\MasterData\JenisLayananRepository;
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
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
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
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'alasan' => 'nullable|string',
                'catatan_pemohon' => 'nullable|string',
                'id_smt_mulai_cuti' => 'nullable|string|max:10',
                'jumlah_semester_cuti' => 'nullable|integer|in:1,2',
                'id_prodi_tujuan' => 'nullable|uuid',
                'id_fakultas_tujuan' => 'nullable|uuid',
            ]);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');

            // Generate nomor
            $data['nomor_permohonan'] = $this->repository->generateNomor($jenisLayanan->kode_layanan);
            $data['id_pemohon'] = $user->id_pengguna;
            $data['status'] = 'draft';
            $data['id_creator'] = $user->id_pengguna;

            // Begin transaction + set audit context
            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Create pengajuan
            $pengajuan = $this->repository->create($data);

            // Create data pemohon snapshot dari pdut user data
            $this->repository->createDataPemohon([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'id_mahasiswa' => $user->id_pengguna,
                'nim' => $user->username ?? '',
                'nm_mahasiswa' => $user->nm_pengguna ?? $user->nama ?? '',
                'id_creator' => $user->id_pengguna,
                // Fields lain akan di-enrich dari pdut nanti
            ]);

            // Create riwayat: draft
            $this->repository->createRiwayat([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'urutan' => 1,
                'nm_tahapan' => 'Pengajuan dibuat',
                'status_dari' => '',
                'status_ke' => 'draft',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => 'mahasiswa',
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

            $user = $request->user();
            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $statusDari = $pengajuan->status;
            $this->repository->updateStatus($id, 'diajukan', $user->id_pengguna);

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
