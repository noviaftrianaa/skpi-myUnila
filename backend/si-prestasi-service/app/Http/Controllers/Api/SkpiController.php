<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SkpiController extends Controller
{
    /**
     * ==========================================
     * 1. MAHASISWA ENDPOINTS
     * ==========================================
     */

    /**
     * GET /api/v1/skpi/mahasiswa/dashboard
     */
    public function mahasiswaDashboard(Request $request)
    {
        $npm = $request->user()->npm ?? $request->query('npm', '2215061024');

        $profile = DB::table('mahasiswa')
            ->where('npm', $npm)
            ->select('npm', 'nama', 'program_studi as programStudi', 'fakultas', 'skpi_is_locked as isLocked')
            ->first();

        if (!$profile) {
            $profile = (object)[
                'npm' => $npm,
                'nama' => 'NOVIA FITRIANA HUDA',
                'programStudi' => 'S1 Teknik Informatika (S1)',
                'fakultas' => 'Fakultas Teknik',
                'isLocked' => false,
            ];
        }

        $statsQuery = DB::table('kegiatan_skpi')
            ->where('npm', $npm)
            ->select(
                DB::raw("COUNT(id) as totalKegiatan"),
                DB::raw("COALESCE(SUM(CASE WHEN status = 'Divalidasi' THEN poin ELSE 0 END), 0) as totalPoin"),
                DB::raw("COUNT(CASE WHEN status = 'Divalidasi' THEN 1 END) as divalidasi"),
                DB::raw("COUNT(CASE WHEN status = 'Belum Diperiksa' THEN 1 END) as menungguValidasi")
            )
            ->first();

        $prestasiPerTahun = [
            ['year' => '2022', 'Internasional' => 0, 'Nasional' => 0, 'Lokal' => 1, 'Tidak Terkategorisasi' => 0],
            ['year' => '2025', 'Internasional' => 2, 'Nasional' => 3, 'Lokal' => 2, 'Tidak Terkategorisasi' => 2],
        ];

        $jenisPrestasi = [
            ['label' => 'Internasional', 'count' => 2, 'dotColor' => 'bg-[#0A2647]', 'textColor' => 'text-[#0A2647]'],
            ['label' => 'Nasional', 'count' => 3, 'dotColor' => 'bg-[#0B63C6]', 'textColor' => 'text-[#0B63C6]'],
            ['label' => 'Lokal', 'count' => 3, 'dotColor' => 'bg-[#5097E1]', 'textColor' => 'text-[#5097E1]'],
            ['label' => 'Tidak Terkategorisasi', 'count' => 2, 'dotColor' => 'bg-[#CBD5E1]', 'textColor' => 'text-[#64748B]'],
        ];

        $kategoriDistribution = [
            ['name' => 'Lomba', 'value' => 2, 'color' => '#2563eb', 'percent' => '20%'],
            ['name' => 'Seminar', 'value' => 2, 'color' => '#8b5cf6', 'percent' => '20%'],
            ['name' => 'Karya', 'value' => 2, 'color' => '#ec4899', 'percent' => '20%'],
            ['name' => 'Pelatihan', 'value' => 1, 'color' => '#f59e0b', 'percent' => '10%'],
            ['name' => 'Organisasi', 'value' => 1, 'color' => '#10b981', 'percent' => '10%'],
            ['name' => 'Publikasi', 'value' => 1, 'color' => '#06b6d4', 'percent' => '10%'],
            ['name' => 'PKKMB Universitas', 'value' => 1, 'color' => '#64748b', 'percent' => '10%'],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data SKPI mahasiswa berhasil diambil.',
            'data' => [
                'profile' => $profile,
                'stats' => [
                    'totalKegiatan' => (int) ($statsQuery->totalKegiatan ?? 8),
                    'totalPoin' => (int) ($statsQuery->totalPoin ?? 68),
                    'targetPoin' => 100,
                    'divalidasi' => (int) ($statsQuery->divalidasi ?? 4),
                    'menungguValidasi' => (int) ($statsQuery->menungguValidasi ?? 3),
                ],
                'prestasiPerTahun' => $prestasiPerTahun,
                'jenisPrestasi' => $jenisPrestasi,
                'kategoriDistribution' => $kategoriDistribution,
            ],
        ]);
    }

    /**
     * GET /api/v1/skpi/mahasiswa/kegiatan
     */
    public function mahasiswaKegiatan(Request $request)
    {
        $npm = $request->user()->npm ?? $request->query('npm', '2215061024');
        $search = $request->query('search');
        $status = $request->query('status');
        $kategori = $request->query('kategori');

        $query = DB::table('kegiatan_skpi')->where('npm', $npm);

        if ($search) {
            $query->where('judul_kegiatan', 'like', "%{$search}%");
        }
        if ($status && $status !== 'Semua Status') {
            $query->where('status', $status);
        }
        if ($kategori && $kategori !== 'Semua Kategori') {
            $query->where('kategori', $kategori);
        }

        $items = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * POST /api/v1/skpi/mahasiswa/kegiatan
     */
    public function storeKegiatan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'judulKegiatan' => 'required|string|max:255',
            'kategori' => 'required|string',
            'tingkatan' => 'required|string',
            'peran' => 'required|string',
            'tanggal' => 'required|date',
            'sertifikat' => 'required|file|mimes:pdf,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $fileUrl = null;
        if ($request->hasFile('sertifikat')) {
            $path = $request->file('sertifikat')->store('uploads/sertifikat', 'public');
            $fileUrl = Storage::url($path);
        }

        $id = 'SKPI-' . time();
        $npm = $request->user()->npm ?? '2215061024';

        DB::table('kegiatan_skpi')->insert([
            'id' => $id,
            'npm' => $npm,
            'judul_kegiatan' => $request->judulKegiatan,
            'kategori' => $request->kategori,
            'sub_kategori' => $request->subKategori ?? '',
            'tingkatan' => $request->tingkatan,
            'peran' => $request->peran,
            'tanggal' => $request->tanggal,
            'penyelenggara' => $request->penyelenggara ?? '',
            'poin' => 0,
            'status' => 'Belum Diperiksa',
            'sertifikat_url' => $fileUrl,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil diajukan.',
            'data' => ['id' => $id, 'status' => 'Belum Diperiksa'],
        ], 201);
    }

    /**
     * PUT /api/v1/skpi/mahasiswa/kegiatan/{id}
     */
    public function updateKegiatan(Request $request, $id)
    {
        $existing = DB::table('kegiatan_skpi')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['success' => false, 'message' => 'Kegiatan tidak ditemukan.'], 404);
        }

        if ($existing->status === 'Divalidasi') {
            return response()->json(['success' => false, 'message' => 'Kegiatan yang sudah divalidasi tidak dapat diubah.'], 403);
        }

        DB::table('kegiatan_skpi')->where('id', $id)->update([
            'judul_kegiatan' => $request->judulKegiatan ?? $existing->judul_kegiatan,
            'kategori' => $request->kategori ?? $existing->kategori,
            'tingkatan' => $request->tingkatan ?? $existing->tingkatan,
            'peran' => $request->peran ?? $existing->peran,
            'tanggal' => $request->tanggal ?? $existing->tanggal,
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil diperbarui.']);
    }

    /**
     * DELETE /api/v1/skpi/mahasiswa/kegiatan/{id}
     */
    public function destroyKegiatan(Request $request, $id)
    {
        $existing = DB::table('kegiatan_skpi')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['success' => false, 'message' => 'Kegiatan tidak ditemukan.'], 404);
        }

        if ($existing->status === 'Divalidasi') {
            return response()->json(['success' => false, 'message' => 'Kegiatan divalidasi tidak dapat dihapus.'], 403);
        }

        DB::table('kegiatan_skpi')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dihapus.']);
    }

    /**
     * ==========================================
     * 2. DOSEN PEMBIMBING ENDPOINTS
     * ==========================================
     */

    /**
     * GET /api/v1/skpi/dosen/dashboard
     */
    public function dosenDashboard(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'totalMahasiswa' => 12,
                    'totalPrestasi' => 48,
                    'validasiDisetujui' => 36,
                    'perluRevisi' => 4,
                ],
            ],
        ]);
    }

    /**
     * ==========================================
     * 3. ADMIN ENDPOINTS
     * ==========================================
     */

    /**
     * GET /api/v1/skpi/admin/validasi
     */
    public function adminValidasiQueue(Request $request)
    {
        $items = DB::table('kegiatan_skpi')
            ->where('status', '!=', 'Ditolak')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * PUT /api/v1/skpi/admin/validasi/{id}/setujui
     */
    public function setujuiValidasi(Request $request, $id)
    {
        $poin = $request->input('poin', 10);

        DB::table('kegiatan_skpi')->where('id', $id)->update([
            'status' => 'Divalidasi',
            'poin' => (int) $poin,
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => "Kegiatan {$id} berhasil divalidasi dengan {$poin} poin."]);
    }

    /**
     * PUT /api/v1/skpi/admin/validasi/{id}/tangguhkan
     */
    public function tangguhkanValidasi(Request $request, $id)
    {
        $catatan = $request->input('catatanRevisi', 'Perlu revisi data/dokumen.');

        DB::table('kegiatan_skpi')->where('id', $id)->update([
            'status' => 'Ditangguhkan',
            'catatan_revisi' => $catatan,
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Kegiatan ditangguhkan untuk revisi mahasiswa.']);
    }

    /**
     * PUT /api/v1/skpi/admin/validasi/{id}/tolak
     */
    public function tolakValidasi(Request $request, $id)
    {
        // Tolak permanen -> Langsung hapus dari antrean validasi admin
        DB::table('kegiatan_skpi')->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => 'Kegiatan ditolak dan terhapus otomatis dari antrean validasi.']);
    }

    /**
     * POST /api/v1/skpi/admin/mahasiswa/{npm}/kunci
     */
    public function toggleLockSkpi(Request $request, $npm)
    {
        $isLocked = (bool) $request->input('isLocked', true);

        DB::table('mahasiswa')->where('npm', $npm)->update([
            'skpi_is_locked' => $isLocked,
            'updated_at' => now(),
        ]);

        $statusStr = $isLocked ? 'dikunci (Final)' : 'dibuka kembali';
        return response()->json(['success' => true, 'message' => "Transkrip SKPI mahasiswa {$npm} berhasil {$statusStr}."]);
    }
}
