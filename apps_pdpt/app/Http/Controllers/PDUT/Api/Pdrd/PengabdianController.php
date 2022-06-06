<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Dok\DokLitabmas;
use App\Models\PDUT\Dok\Dokumen;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\NonCaAnggotaLitabmas;
use App\Models\PDUT\Pdrd\PdAnggotaLitabmas;
use App\Models\PDUT\Pdrd\SdmAnggotaLitabmas;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Http\Response;

class PengabdianController extends Controller
{
    protected $request;
    protected $litabmas;
    protected $sdmLitabmas;
    protected $pdLitabmas;
    protected $nonCaLitabmas;
    protected $dokLitabmas;
    protected $dokumen;

    protected $getAllListPengabdian;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->litabmas = new Litabmas();
        $this->sdmLitabmas = new SdmAnggotaLitabmas();
        $this->pdLitabmas = new PdAnggotaLitabmas();
        $this->nonCaLitabmas = new NonCaAnggotaLitabmas();
        $this->dokLitabmas = new DokLitabmas();
        $this->dokumen = new Dokumen();
        $this->cacheLifeTime = 3600;
        $this->getAllListPengabdian = [];
    }


    public function getAllListPengabdian()
    {
        InputValidator([
            'sort_by' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'limit' => 'numeric'
        ]);

        $sortby = $this->request->input('sort_by');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }


        $query =  "
            SELECT
                lm.id_litabmas AS id_penelitian,
                lm.judul_litabmas AS judul_penelitian,
                kb.nm_kel_bidang AS bidang_keilmuan,
                lm.id_thn_laks AS tahun_pelaksanaan,
                lm.lama_kegiatan AS lama_kegiatan,
                lm.create_date AS waktu_data_ditambahkan,
                lm.last_update AS terakhir_diubah
            FROM
                pdrd.litabmas AS lm WITH(NOLOCK)
                LEFT JOIN (
                    SELECT
                        DISTINCT id_litabmas
                    FROM
                        pdrd.sdm_anggota_litabmas
                    WHERE
                        id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
                        AND soft_delete = 0
                ) AS sal ON sal.id_litabmas = lm.id_litabmas
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = lm.id_kel_bidang
                AND kb.expired_date IS NULL
            WHERE
                lm.soft_delete = 0
            ORDER BY lm.id_thn_laks " . $sortby . "
        ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse(['data' => NULL], 'tidak ditemukan data pengabdian', FALSE);
        }

        $data = [];
        foreach ($query as $value) {
            $data[] = [
                'id_penelitian' => $value->id_penelitian,
                'judul_penelitian' => $value->judul_penelitian,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
                'lama_kegiatan' => $value->lama_kegiatan,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
            ];
        }

        return WrapResponse([
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'data' => $data
        ], 'sukses');
    }

    public function getListPengabdianBySdmId()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sdmId = $this->request->input('id_sdm');
        $sortBy = $this->request->input('sort_by');
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        $query = "
        SELECT
            litabmas.id_litabmas AS id_penelitian,
            litabmas.judul_litabmas AS judul_penelitian,
            kb.nm_kel_bidang AS bidang_keilmuan,
            CONCAT(
                (litabmas.id_thn_laks - 1),
                '/',
                litabmas.id_thn_laks
            ) AS tahun_pelaksanaan,
            litabmas.lama_kegiatan AS lama_kegiatan,
            litabmas.create_date AS waktu_data_ditambahkan,
            litabmas.last_update AS terakhir_diubah
        FROM
            pdrd.litabmas AS litabmas WITH(NOLOCK)
            JOIN pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK) ON sal.id_litabmas = litabmas.id_litabmas
            AND sal.id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
            AND sal.soft_delete = 0
            JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = litabmas.id_kel_bidang
            AND kb.expired_date IS NULL
            JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = sal.id_sdm
            AND sdm.soft_delete = 0
            AND sdm.id_sdm = '" . $sdmId . "'
        WHERE
            litabmas.soft_delete = 0
        ORDER BY
            litabmas.id_thn_laks " . $sortBy . "
    ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse([], "tidak ditemukan data penelitian dari sdm id $sdmId", FALSE);
        }

        $data = [];
        foreach ($query as $value) {
            $data[] = [
                'id_penelitian' => $value->id_penelitian,
                'judul_penelitian' => $value->judul_penelitian,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
                'lama_kegiatan' => $value->lama_kegiatan,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
            ];
        }

        return WrapResponse([
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'data' => $data
        ], 'sukses');
    }


    public function getDetailPengabdianByPengabdianId($id)
    {
        $reformatGetDetailPengabdian = [];

        request()->merge(['id_pengabdian' => $id]);
        InputValidator([
            'id_pengabdian' => 'required|uuid',
        ], [
            'id_pengabdian.required' => 'field pengabdian id ini harus diisi',
            'id_pengabdian.uuid' => 'input pengabdian id harus berupa uuid yang valid',
        ]);

        $pengabdianId = $this->request->input('id_pengabdian');

        try {
            $query = "
                SELECT
                    skim_kegiatan.nm_skim AS nama_skim,
                    litabmas.id_thn_laks AS tahun_anggaran,
                    litabmas.judul_litabmas AS judul_penelitian,
                    lembaga_iptek.nm_lemb AS afiliasi,
                    kb.nm_kel_bidang AS kelompok_bidang,
                    litabmas.sk_tugas AS no_sk_penugasan,
                    litabmas.tgl_sk_tugas AS tgl_sk_penugasan,
                    litabmas.lama_kegiatan AS lama_kegiatan,
                    litabmas.lokasi_kegiatan AS lokasi_kegiatan,
                    litabmas.thn_laks_ke AS th_pelaksanaan,
                    litabmas.dana_dikti AS dana_dikti,
                    litabmas.dana_pt AS dana_pt,
                    litabmas.dana_institusi_lain AS dana_il
                FROM
                    pdrd.litabmas AS litabmas WITH(NOLOCK)
                    LEFT JOIN pdrd.lembaga_iptek AS lembaga_iptek WITH(NOLOCK) ON lembaga_iptek.id_lemb_iptek = litabmas.id_lemb_iptek
                    AND lembaga_iptek.soft_delete = 0
                    LEFT JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = litabmas.id_kel_bidang
                    AND kb.expired_date IS NULL
                    LEFT JOIN ref.skim_kegiatan AS skim_kegiatan WITH(NOLOCK) ON skim_kegiatan.id_skim = litabmas.id_skim
                    AND skim_kegiatan.expired_date IS NULL
                WHERE
                    litabmas.id_litabmas = ?
                    AND litabmas.soft_delete = 0
                ";
            $getDetailPengabdian = DB::select($query, [$pengabdianId]);
            if (empty($getDetailPengabdian)) {
                return WrapResponse([], "pengabdian $pengabdianId tidak ditemukan", FALSE);
            }
            foreach ($getDetailPengabdian as $value) {
                $reformatGetDetailPengabdian = [
                    'tahun_anggaran' => $value->tahun_anggaran,
                    'afiliasi' => $value->afiliasi,
                    'kelompok_bidang' => $value->kelompok_bidang,
                    'no_sk_penugasan' => $value->no_sk_penugasan,
                    'tgl_sk_penugasan' => $value->tgl_sk_penugasan,
                    'lama_kegiatan' => $value->lama_kegiatan,
                    'judul_penelitian' => $value->judul_penelitian,
                    'lokasi_kegiatan' => $value->lokasi_kegiatan,
                    'tahun_pelaksanaan' => $value->tahun_anggaran,
                    'dana_dikti' => $value->dana_dikti,
                    'data_pt' => $value->dana_pt,
                    'dana_institusi_lain' => $value->dana_il,
                ];
            }

            $query = "
                    SELECT
                        sal.id_sdm AS id_anggota_dosen,
                        sdm.nm_sdm AS nama_dosen,
                        sal.peran_litabmas AS peran_dosen,
                        sal.stat_aktif AS keaktifan
                    FROM
                        pdrd.sdm_anggota_litabmas AS sal
                        JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm
                        AND sdm.id_jns_sdm = 12
                        AND sdm.soft_delete = 0
                    WHERE
                        sal.id_litabmas = ?
                        AND sal.id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
                        AND sal.soft_delete = 0
            ";
            $getDaftarAnggotaDosen = DB::select($query, [$pengabdianId]);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_dosen', $getDaftarAnggotaDosen);

            $query = "
                SELECT
                    pal.id_pd_ang_litabmas AS id_anggota_mahasiswa,
                    pd.nm_pd AS nama_mahasiswa,
                    pal.peran_litabmas AS peran_mahasiswa,
                    pal.stat_aktif AS keaktifan
                FROM
                    pdrd.pd_anggota_litabmas AS pal WITH(NOLOCK)
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = pal.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    pal.id_litabmas = ?
                    AND pal.soft_delete = 0
            ";
            $getDaftarAnggotaMahasiswa = DB::select($query, [$pengabdianId]);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_mahasiswa', $getDaftarAnggotaMahasiswa);

            $query = "
                SELECT
                    nca_litabmas.id_orang AS id_anggota_nonca,
                    nca.nm_orang AS nama_nonca,
                    nca_litabmas.peran_litabmas AS peran_nonca,
                    nca_litabmas.stat_aktif AS keaktifan
                FROM
                    pdrd.non_ca_anggota_litabmas AS nca_litabmas WITH(NOLOCK)
                    JOIN pdrd.non_ca AS nca WITH(NOLOCK) ON nca.id_orang = nca_litabmas.id_orang
                    AND nca.soft_delete = 0
                WHERE
                    nca_litabmas.id_litabmas = ?
                    AND nca_litabmas.soft_delete = 0
            ";
            $getDaftarAnggotaNonCA = DB::select($query, [$pengabdianId]);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_non_ca', $getDaftarAnggotaNonCA);

            $query = "
                SELECT
                    dok_dokumen.id_dok AS id_dokumen,
                    dok_dokumen.nm_dok AS nama_dok,
                    dok_dokumen.file_name AS nama_file,
                    dok_dokumen.media_type AS jenis_file,
                    dok_litabmas.create_date AS tanggal_upload,
                    refj_dokumen.nm_jns_dok AS jenis_dokumen
                FROM
                    pdrd.litabmas AS litabmas WITH(NOLOCK)
                    JOIN dok.dok_litabmas AS dok_litabmas WITH(NOLOCK) ON dok_litabmas.id_litabmas = litabmas.id_litabmas
                    AND dok_litabmas.soft_delete = 0
                    LEFT JOIN dok.dokumen AS dok_dokumen WITH(NOLOCK) ON dok_dokumen.id_dok = dok_litabmas.id_dok
                    AND dok_dokumen.soft_delete = 0
                    LEFT JOIN ref.jenis_dokumen AS refj_dokumen WITH(NOLOCK) ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
                    AND refj_dokumen.expired_date IS NULL
                WHERE
                    litabmas.id_litabmas = ?
                    AND litabmas.soft_delete = 0
            ";
            $getDaftarDokumenPengabdian = DB::select($query, [$pengabdianId]);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'dokumen_penelitian', $getDaftarDokumenPengabdian);

            $data = $reformatGetDetailPengabdian;

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data pengabdian tidak ditemukan atau data pengabdian tidak terdaftar", FALSE);
        }
    }

    public function storePengabdian()
    {
        InputValidator([
            'judul_kegiatan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'afiliasi' => 'required|uuid',
            'kel_bidang' => 'nullable|uuid',
            'litabmas_lanjutan' => 'nullable|uuid',
            'jenis_skim' => 'nullable|uuid',
            'lokasi_kegiatan' => 'nullable|string',
            'tahun_usulan' => 'required|date_format:Y',
            'tahun_pelaksanaan' => 'required|date_format:Y',
            'tahun_kegiatan' => 'required|date_format:Y',
            'lama_kegiatan' => 'required|numeric|min:1|max:10',
            'dana_dikti' => 'required|numeric|gte:0',
            'dana_pt' => 'required|numeric|gte:0',
            'dana_institusi_lain' => 'required|numeric|gte:0',
            'in_kind' => 'nullable|uuid',
            'no_sk_penugasan' => 'nullable|regex:/^[A-Z0-9\/\.]+$/',
            'tgl_sk_penugasan' => 'nullable|date_format:Y-m-d',
            'dok_penelitian.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt|max:2048',
            'nama_dok.*' => 'required_with:dok_penelitian|string',
            'keterangan_dok.*' => 'required_with:dok_penelitian|string',
            'jenis_dok.*' => 'nullable|numeric',
            'url_dok.*' => 'nullable|url',
            'anggota_dosen.*' => 'nullable|uuid',
            'peran_dosen.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_dosen.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_mahasiswa.*' => 'nullable|uuid',
            'peran_mahasiswa.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_mahasiswa.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_non_ca.*' => 'nullable|uuid',
            'peran_non_ca.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_non_ca.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])]
        ]);

        $litabmasId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = 130201;
        $kat_kegiatan = 130202;
        $kat_kegiatan = 130203;
        $kat_kegiatan = 130204;
        $kat_kegiatan = 130401;
        $kat_kegiatan = 130402;
        $kat_kegiatan = 130403;

        $dok_tmp_path = storage_path('uploads');
        if (!File::isDirectory($dok_tmp_path)) {
            File::makeDirectory($dok_tmp_path, 0755, true, true);
        }

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_lanjutan = $this->request->input('litabmas_lanjutan');
        $jenis_skim = $this->request->input('jenis_skim');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $tahun_usulan = $this->request->input('tahun_usulan');
        $tahun_kegiatan = $this->request->input('tahun_kegiatan');
        $lama_kegiatan = $this->request->input('lama_kegiatan');
        $tahun_pelaksanaan = $this->request->input('tahun_pelaksanaan');
        $dana_dikti = $this->request->input('dana_dikti');
        $dana_pt = $this->request->input('dana_pt');
        $dana_institusi_lain = $this->request->input('dana_institusi_lain');
        $in_kind = $this->request->input('in_kind');
        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');

        $dok_penelitian = $this->request->file('dok_penelitian');
        $nama_dok = $this->request->input('nama_dok');
        $keterangan_dok = $this->request->input('keterangan_dok');
        $jenis_dok = $this->request->input('jenis_dok');
        $url_dok = $this->request->input('url_dok');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $anggota_non_ca = $this->request->input('anggota_non_ca');
        $peran_non_ca = $this->request->input('peran_non_ca');
        $status_non_ca = $this->request->input('status_non_ca');

        DB::beginTransaction();
        try {
            $pengabdian = $this->litabmas->create([
                'dana_dikti' => $dana_dikti,
                'dana_institusi_lain' => $dana_institusi_lain,
                'dana_pt' => $dana_pt,
                'id_creator' => $creatorId,
                'id_jns_lit' => NULL,
                'id_kel_bidang' => $kel_bidang,
                'id_lanjutan_litabmas' => $litabmas_lanjutan,
                'id_lemb_iptek' => $afiliasi,
                'id_litabmas' => $litabmasId,
                'id_skim' => $jenis_skim,
                'id_smi' => NULL,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_thn_usulan' => $tahun_usulan,
                'id_tse' => NULL,
                'id_updater' => $updateId,
                'in_kind' => $in_kind,
                'jns_litabmas' => 'M',
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'stat_aktif' => 1,
                'thn_laks_ke' => $tahun_pelaksanaan,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            if (!empty($dok_penelitian)) {
                foreach ($dok_penelitian as $index => $dok) {
                    if (is_null($dok)) break;

                    $fileInfo = explode('.', $dok->getClientOriginalName());
                    $fileOriginalName = $fileInfo[0];
                    $fileExtension = $dok->getClientOriginalExtension();
                    $fileMime = $dok->getClientMimeType();
                    $fileName = str_replace(' ', '_', trim($nama_dok[$index])) . '.' . $fileExtension;
                    if ($dok->move($dok_tmp_path, $fileName)) {
                        $filePath = $dok_tmp_path . DIRECTORY_SEPARATOR . $fileName;
                        $openFile = fopen($filePath, 'r');
                        flock($openFile, LOCK_EX);
                        $fileContent = base64_encode(fread($openFile, filesize($filePath)));
                        flock($openFile, LOCK_UN);
                        fclose($openFile);

                        $dokumen = $this->dokumen->create([
                            'id_dok' => guid(),
                            'id_jns_dok' => $jenis_dok[$index],
                            'nm_dok' => $fileOriginalName,
                            'ket_dok' => $keterangan_dok[$index],
                            'wkt_unggah' => currDateTime(),
                            'url' => $url_dok[$index],
                            'media_type' => $fileMime,
                            'file_name' => $fileName,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                            'file_dok' => DB::raw("CONVERT(VARBINARY(MAX), '" . $fileContent . "')"),
                        ]);

                        $this->dokLitabmas->create([
                            'id_litabmas' => $pengabdian->id_litabmas,
                            'id_dok' => $dokumen->id_dok,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);

                        @unlink($filePath);
                    } else {
                        return WrapResponse([], 'gagal upload dokumen', FALSE);
                    }
                }
            }

            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $index => $idDosen) {
                    if (is_null($idDosen)) break;

                    $this->sdmLitabmas->create([
                        'id_litabmas' => $pengabdian->id_litabmas,
                        'id_sdm' => $idDosen,
                        'id_katgiat' => $kat_kegiatan,
                        'peran_litabmas' => $peran_dosen[$index],
                        'stat_aktif' => $status_dosen[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $index => $idMahasiswa) {
                    if (is_null($idMahasiswa)) break;

                    $dataMahasiswa = DB::select("
                        SELECT
                            TOP 1
                            pd.nm_pd AS nama_mahasiswa,
                            reg_pd.nipd AS nipd
                        FROM
                            pdrd.peserta_didik AS pd WITH(NOLOCK)
                            LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                            AND reg_pd.soft_delete = 0
                        WHERE
                            pd.id_pd = ?
                            AND pd.soft_delete = 0
                    ", [$idMahasiswa]);

                    if (empty($dataMahasiswa)) {
                        return WrapResponse([], 'tidak ditemukan data mahasiswa anggota pnelitian', FALSE);
                    }

                    $this->pdLitabmas->create([
                        'id_pd_ang_litabmas' => guid(),
                        'id_litabmas' => $pengabdian->id_litabmas,
                        'id_pd' => $idMahasiswa,
                        'peran_litabmas' => $peran_mahasiswa[$index],
                        'stat_aktif' => $status_mahasiswa[$index],
                        'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                        'nipd' => $dataMahasiswa[0]->nipd,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($anggota_non_ca)) {
                foreach ($anggota_non_ca as $index => $idNonCa) {
                    if (is_null($idNonCa)) break;

                    $this->nonCaLitabmas->create([
                        'id_litabmas' => $pengabdian->id_litabmas,
                        'id_orang' => $idNonCa,
                        'peran_litabmas' => $peran_non_ca[$index],
                        'stat_aktif' => $status_non_ca[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            DB::commit();
            return WrapResponse([], 'sukses menambahkan penelitian - ' . $litabmasId);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse([], 'penelitian tidak ditemukan atau penelitian tidak terdaftar', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan penelitian");
        }
    }

    public function updatePengabdian()
    {
        InputValidator([
            'id_penelitian' => 'required|uuid',
            'judul_kegiatan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'afiliasi' => 'required|uuid',
            'kel_bidang' => 'uuid',
            'litabmas_lanjutan' => 'nullable|uuid',
            'jenis_skim' => 'nullable|uuid',
            'lokasi_kegiatan' => 'string',
            'tahun_usulan' => 'required|date_format:Y',
            'tahun_pelaksanaan' => 'required|date_format:Y',
            'tahun_kegiatan' => 'required|date_format:Y',
            'lama_kegiatan' => 'required|numeric|min:1|max:10',
            'dana_dikti' => 'required|numeric|gte:0',
            'dana_pt' => 'required|numeric|gte:0',
            'dana_institusi_lain' => 'required|numeric|gte:0',
            'in_kind' => 'nullable|uuid',
            'no_sk_penugasan' => 'regex:/^[A-Z0-9\/\.]+$/',
            'tgl_sk_penugasan' => 'date_format:Y-m-d',
            'dok_penelitian.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt|max:2048',
            'nama_dok.*' => 'nullable|string',
            'keterangan_dok.*' => 'required_with:dok_penelitian.*|nullable|string',
            'jenis_dok.*' => 'nullable|numeric',
            'url_dok.*' => 'nullable|url',
            'anggota_dosen.*' => 'nullable|uuid',
            'peran_dosen.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_dosen.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'pd_litabmas_mahasiswa_id.*' => 'nullable|uuid',
            'anggota_mahasiswa.*' => 'nullable|uuid',
            'peran_mahasiswa.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_mahasiswa.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_non_ca.*' => 'nullable|uuid',
            'peran_non_ca.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_non_ca.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])]
        ]);

        $litabmasId = $this->request->input('id_penelitian');
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = 130201;
        $kat_kegiatan = 130202;
        $kat_kegiatan = 130203;
        $kat_kegiatan = 130204;
        $kat_kegiatan = 130401;
        $kat_kegiatan = 130402;
        $kat_kegiatan = 130403;

        $dok_tmp_path = storage_path('uploads');
        if (!File::isDirectory($dok_tmp_path)) {
            File::makeDirectory($dok_tmp_path, 0755, true, true);
        }

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_lanjutan = $this->request->input('litabmas_lanjutan');
        $jenis_skim = $this->request->input('jenis_skim');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $tahun_usulan = $this->request->input('tahun_usulan');
        $tahun_kegiatan = $this->request->input('tahun_kegiatan');
        $lama_kegiatan = $this->request->input('lama_kegiatan');
        $tahun_pelaksanaan = $this->request->input('tahun_pelaksanaan');
        $dana_dikti = $this->request->input('dana_dikti');
        $dana_pt = $this->request->input('dana_pt');
        $dana_institusi_lain = $this->request->input('dana_institusi_lain');
        $in_kind = $this->request->input('in_kind');

        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');

        $dok_penelitian = $this->request->file('dok_penelitian');
        $nama_dok = $this->request->input('nama_dok');
        $keterangan_dok = $this->request->input('keterangan_dok');
        $jenis_dok = $this->request->input('jenis_dok');
        $url_dok = $this->request->input('url_dok');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $pdLitabmasId = $this->request->input('pd_litabmas_mahasiswa_id');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $anggota_non_ca = $this->request->input('anggota_non_ca');
        $peran_non_ca = $this->request->input('peran_non_ca');
        $status_non_ca = $this->request->input('status_non_ca');

        DB::beginTransaction();
        try {
            $pengabdian = $this->litabmas->where('id_litabmas', $litabmasId)->first();
            if (!$pengabdian)
                return WrapResponse([], 'pengabdian tidak ditemukan atau pengabdian tidak terdaftar', FALSE);

            $pengabdian->update([
                'id_litabmas' => $litabmasId,
                'id_lemb_iptek' => $afiliasi,
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'thn_laks_ke' => $tahun_pelaksanaan,
                'dana_dikti' => $dana_dikti,
                'dana_pt' => $dana_pt,
                'dana_institusi_lain' => $dana_institusi_lain,
                'in_kind' => $in_kind,
                'stat_aktif' => 1,
                'jns_litabmas' => 'M',
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'id_skim' => $jenis_skim,
                'id_thn_usulan' => $tahun_usulan,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_lanjutan_litabmas' => $litabmas_lanjutan,
                'id_kel_bidang' => $kel_bidang,
                'id_tse' => NULL,
                'id_smi' => NULL,
                'id_jns_lit' => NULL,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
            ]);

            if (!empty($dok_penelitian)) {
                foreach ($dok_penelitian as $index => $dok) {
                    if (is_null($dok)) break;

                    $fileInfo = explode('.', $dok->getClientOriginalName());
                    $fileOriginalName = $fileInfo[0];
                    $fileExtension = $dok->getClientOriginalExtension();
                    $fileMime = $dok->getClientMimeType();
                    $fileName = str_replace(' ', '_', trim($nama_dok[$index])) . '.' . $fileExtension;
                    if ($dok->move($dok_tmp_path, $fileName)) {
                        $filePath = $dok_tmp_path . DIRECTORY_SEPARATOR . $fileName;
                        $openFile = fopen($filePath, 'r');
                        flock($openFile, LOCK_EX);
                        $fileContent = base64_encode(fread($openFile, filesize($filePath)));
                        flock($openFile, LOCK_UN);
                        fclose($openFile);


                        $dokumen = $this->dokumen->create([
                            'id_dok' => guid(),
                            'id_jns_dok' => $jenis_dok[$index],
                            'nm_dok' => $fileOriginalName,
                            'ket_dok' => $keterangan_dok[$index],
                            'wkt_unggah' => currDateTime(),
                            'url' => $url_dok[$index],
                            'media_type' => $fileMime,
                            'file_name' => $fileName,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                            'file_dok' => DB::raw("CONVERT(VARBINARY(MAX), '" . $fileContent . "')"),
                        ]);

                        $this->dokLitabmas->create([
                            'id_litabmas' => $litabmasId,
                            'id_dok' => $dokumen->id_dok,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);

                        @unlink($filePath);
                    } else {
                        return WrapResponse([], 'gagal upload dokumen', FALSE);
                    }
                }
            }

            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $index => $idDosen) {
                    if (is_null($idDosen)) break;

                    $anggota_dosen = $this->sdmLitabmas->where('id_litabmas', $litabmasId)->where('id_sdm', $idDosen)->first();
                    if (!$anggota_dosen) {
                        $this->sdmLitabmas->create([
                            'id_litabmas' => $litabmasId,
                            'id_sdm' => $idDosen,
                            'id_katgiat' => $kat_kegiatan,
                            'peran_litabmas' => $peran_dosen[$index],
                            'stat_aktif' => $status_dosen[$index],
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);
                    } else {
                        $anggota_dosen->update($pengabdian)([
                            'id_litabmas' => $litabmasId,
                            'id_sdm' => $idDosen,
                            'id_katgiat' => $kat_kegiatan,
                            'peran_litabmas' => $peran_dosen[$index],
                            'stat_aktif' => $status_dosen[$index],
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $index => $idMahasiswa) {
                    if (is_null($idMahasiswa)) break;

                    $anggota_mahasiswa = $this->pdLitabmas->where('id_litabmas', $litabmasId)->where('id_pd', $idMahasiswa)->exists();
                    if (!$anggota_mahasiswa) {
                        $dataMahasiswa = DB::select("
                            SELECT
                                TOP 1
                                pd.nm_pd AS nama_mahasiswa,
                                reg_pd.nipd AS nipd
                            FROM
                                pdrd.peserta_didik AS pd WITH(NOLOCK)
                                LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                                AND reg_pd.soft_delete = 0
                            WHERE
                                pd.id_pd = ?
                                AND pd.soft_delete = 0
                        ", [$idMahasiswa]);

                        if (empty($dataMahasiswa)) {
                            return WrapResponse([], 'tidak ditemukan data mahasiswa anggota pengabdian', FALSE);
                        }
                        $this->pdLitabmas->create([
                            'id_pd_ang_litabmas' => guid(),
                            'id_litabmas' => $pengabdian->id_litabmas,
                            'id_pd' => $idMahasiswa,
                            'peran_litabmas' => $peran_mahasiswa[$index],
                            'stat_aktif' => $status_mahasiswa[$index],
                            'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                            'nipd' => $dataMahasiswa[0]->nipd,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);
                    } else {
                        $dataMahasiswa = DB::select("
                            SELECT
                                TOP 1
                                pd.nm_pd AS nama_mahasiswa,
                                reg_pd.nipd AS nipd
                            FROM
                                pdrd.peserta_didik AS pd WITH(NOLOCK)
                                LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                                AND reg_pd.soft_delete = 0
                            WHERE
                                pd.id_pd = ?
                                AND pd.soft_delete = 0
                        ", [$idMahasiswa]);

                        if (empty($dataMahasiswa)) {
                            return WrapResponse([], 'tidak ditemukan data mahasiswa anggota pengabdian', FALSE);
                        }

                        $anggota_mahasiswa->update([
                            'id_litabmas' => $litabmasId,
                            'id_pd' => $idMahasiswa,
                            'peran_litabmas' => $peran_mahasiswa[$index],
                            'stat_aktif' => $status_mahasiswa[$index],
                            'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                            'nipd' => $dataMahasiswa[0]->nipd,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            if (!empty($anggota_non_ca)) {
                foreach ($anggota_non_ca as $index => $idNonCa) {
                    if (is_null($idNonCa)) break;

                    $anggota_non_ca = $this->nonCaLitabmas->where('id_litabmas', $litabmasId)->where('id_orang', $idNonCa)->exists();
                    if (!$anggota_non_ca) {
                        $this->nonCaLitabmas->create([
                            'id_litabmas' => $litabmasId,
                            'id_orang' => $idNonCa,
                            'peran_litabmas' => $peran_non_ca[$index],
                            'stat_aktif' => $status_non_ca[$index],
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);
                    } else {
                        $anggota_non_ca->update([
                            'id_litabmas' => $litabmasId,
                            'id_orang' => $idNonCa,
                            'peran_litabmas' => $peran_non_ca[$index],
                            'stat_aktif' => $status_non_ca[$index],
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            DB::commit();
            return WrapResponse([], 'sukses mengupdate data pengabdian - ' . $litabmasId);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse([], 'pengabdian tidak ditemukan atau pengabdian tidak terdaftar', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('error on Function ' . __FUNCTION__ . ' with ' . $e->getMessage() . ' on ' . $e->getLine());
            return WrapResponse([], "gagal mengupdate data pengabdian $litabmasId", FALSE);
        }
    }

    public function deletePengabdian()
    {
        InputValidator([
            'id_pengabdian' => 'required|uuid',
        ], [
            'id_pengabdian.required' => 'field pengabdianid ini harus diisi',
            'id_pengabdian.uuid' => 'input pengabdianid harus berupa uuid yang valid',
        ]);

        $pengabdianId = $this->request->input('id_pengabdian');

        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.litabmas SET soft_delete = 1 WHERE id_litabmas = $pengabdianId");
            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('berhasial menghapus data pengabdian - ' . $pengabdianId)->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::DELETE_FAILED)->setError(['query' => "gagal menghapus pengabdian $pengabdianId"]);
        }
    }
}
